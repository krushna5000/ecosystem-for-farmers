// Business rules for the farmer-app OTP login. Throws AppError subclasses; never touches req/res or db directly.
// Tokens are signed with the RAW env.jwtSecret (not portalSecret) so mobile sessions survive the portal merge.
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import {
  findUserByPhoneInDB,
  createUserInDB,
  markUserVerifiedInDB,
  updateUserProfileInDB,
  createOtpInDB,
  findValidOtpInDB,
  markOtpUsedInDB,
} from "./appAuth.factory.js";
import { generateOTP, OTP_TTL_MS } from "./appAuth.otp.js";
import { AppError, ConflictError, UnauthorizedError, BadRequestError } from "../../errors/index.js";
import { listFarmsByUser, listFarmCropsByUser } from "../appFarm/appFarm.service.js";

// Auth failures always answer `{ success: false, message }`.
const unauthorized = (message) => new UnauthorizedError(message, { body: { success: false, message } });

const TOKEN_TTL = "7d"; // matches the cookie expiry

// signs the 7d JWT the farmer app keeps in its `token` cookie / Authorization header
const signToken = (user) =>
  jwt.sign(
    { id: user.id, phone_number: user.phone_number, full_name: user.full_name },
    env.jwtSecret,
    { expiresIn: TOKEN_TTL },
  );

/** Generates an OTP for this phone number, stores it (5 min validity) and returns it. */
export async function issueOtp(phoneNumber) {
  const otp = generateOTP();
  await createOtpInDB({ phoneNumber, otpCode: otp, expiresAt: new Date(Date.now() + OTP_TTL_MS) });
  return otp;
}

/** Marks a valid OTP as used; 401 when there is none. Shared with the WhatsApp registration flow. */
export async function consumeOtp(phoneNumber, otp) {
  const otpRow = await findValidOtpInDB(phoneNumber, otp);
  if (!otpRow) throw unauthorized("Invalid or expired OTP");
  await markOtpUsedInDB(otpRow.id);
}

export async function registerSendOtp({ phone_number, full_name }, userType) {
  if (await findUserByPhoneInDB(phone_number)) {
    throw new ConflictError("User already exists, please login instead");
  }

  // FIRST API HIT → user_type set here
  await createUserInDB({ fullName: full_name.trim(), phoneNumber: phone_number, userType });

  return issueOtp(phone_number);
}

export async function registerVerifyOtp({ phone_number, otp }) {
  await consumeOtp(phone_number, otp);

  const user = await findUserByPhoneInDB(phone_number);
  await markUserVerifiedInDB(user.id);

  return { token: signToken(user), user };
}

export async function loginSendOtp({ phone_number }) {
  if (!(await findUserByPhoneInDB(phone_number))) {
    // 400 (not 404) is the contract the apps already rely on
    throw new BadRequestError("User not found, please register first");
  }
  return issueOtp(phone_number);
}

export async function loginVerifyOtp({ phone_number, otp }) {
  await consumeOtp(phone_number, otp);

  const user = await findUserByPhoneInDB(phone_number);

  if (!user.is_verified) {
    await markUserVerifiedInDB(user.id);
    user.is_verified = true;
  }

  return { token: signToken(user), user };
}

/**
 * Resolves a JWT to its user. Shared by the auth middleware and GET /auth/verify-auth.
 * Failures are pinned to the exact legacy `{ success: false, message }` bodies.
 */
export async function authenticateToken(token) {
  if (!token) throw unauthorized("No token provided");

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await findUserByPhoneInDB(decoded.phone_number);
    if (!user) throw unauthorized("User not found");

    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error.name === "JsonWebTokenError") throw unauthorized("Invalid token");
    if (error.name === "TokenExpiredError") throw unauthorized("Token expired");

    console.error("Error in authenticateToken:", error);
    throw new AppError("Server error", 500, { body: { success: false, message: "Server error" } });
  }
}

export async function verifyAuth(token) {
  const user = await authenticateToken(token);
  return {
    id: user.id,
    phone_number: user.phone_number,
    full_name: user.full_name,
    is_verified: user.is_verified,
  };
}

export async function getProfile(user) {
  // The user's farms and the crops mapped onto them
  const farms = await listFarmsByUser(user.id);
  const farmCrops = await listFarmCropsByUser(user.id);

  const locations = farms.map((farm) => ({
    village: farm.village_name,
    city: farm.city_name,
    district: farm.district_name,
    state: farm.state_name,
    pincode: farm.pincode,
  }));

  // Remove duplicate locations
  const uniqueLocations = locations.filter(
    (location, index, self) =>
      index === self.findIndex((l) => l.village === location.village && l.pincode === location.pincode),
  );

  // Crops with farm information
  const cropsWithFarms = farmCrops.map((crop) => ({
    farm_crop_id: crop.farm_crop_id,
    farm_id: crop.farm_id,
    farm_name: crop.farm_name,
    crop_id: crop.crop_id,
    crop_name: crop.crop_name,
    sowing_date: crop.sowing_date,
  }));

  return {
    user: {
      id: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
      language: user.language || "English",
      created_at: user.created_at,
    },
    location_area: uniqueLocations,
    total_farms: farms.length,
    total_crops: farmCrops.length,
    crops: cropsWithFarms,
  };
}

export async function updateProfile(userId, { full_name, language }) {
  const updated = await updateUserProfileInDB(userId, full_name ? full_name.trim() : null, language);
  return { id: updated.id, full_name: updated.full_name, language: updated.language };
}
