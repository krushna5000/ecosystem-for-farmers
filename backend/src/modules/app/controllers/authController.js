import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import {
  findUserByPhone,
  createUser,
  updateUserVerified,
  updateUserProfile,
} from "../models/userModel.js";
import { getFarmsByUser, getFarmCropsByUser } from "../models/farmModel.js";
import { createOtp, findOtp, markOtpUsed } from "../models/otpModel.js";
import { generateOTP } from "../utils/otpUtils.js";

const isProduction = env.isProd;

// function to validate mobile numbers
const validatePhoneNumber = (phone) => {
  const regex = /^(?:\+91|91)?[6-9]\d{9}$/;
  return regex.test(phone);
};

// signs the 7d JWT and sets it as the `token` cookie; returns the token
const issueToken = (res, user) => {
  const token = jwt.sign(
    {
      id: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
    },
    env.jwtSecret,
    { expiresIn: "7d" } // match cookie expiry
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // localhost (HTTP)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

const registerSendOtp = async (req, res) => {
  try {
    const { phone_number, full_name } = req.body;
    const detectedUserType = req.detectedUserType; // 'app' or 'web'

    if (!phone_number || !full_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "phone_number and full_name are required",
      });
    }

    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number.",
      });
    }

    // Name validation
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(full_name.trim())) {
      return res.status(400).json({
        success: false,
        message: "Full name should contain only letters and spaces",
      });
    }

    const user = await findUserByPhone(phone_number);
    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists, please login instead",
      });
    }

    // FIRST API HIT → user_type set here
    await createUser(full_name.trim(), phone_number, detectedUserType);

    const otp = generateOTP();
    await createOtp(phone_number, otp);

    return res.status(201).json({
      success: true,
      otp: otp,
      message: "OTP sent for registration",
    });
  } catch (error) {
    console.error("Error in registerSendOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const registerVerifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "phone_number and otp are required",
      });
    }

    const otpRow = await findOtp(phone_number, otp);
    if (!otpRow) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await markOtpUsed(otpRow.id);

    const user = await findUserByPhone(phone_number);
    await updateUserVerified(user.id);

    const token = issueToken(res, user);

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Error in registerVerifyOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loginSendOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: "phone_number is required",
      });
    }

    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number.",
      });
    }

    const user = await findUserByPhone(phone_number);
    if (!user) {
      return res.status(400).json({
        //404 user not found
        success: false,
        message: "User not found, please register first",
      });
    }

    const otp = generateOTP();
    await createOtp(phone_number, otp);

    return res.status(200).json({
      success: true,
      otp: otp,
      message: "OTP sent for login",
    });
  } catch (error) {
    console.error("Error in loginSendOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loginVerifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "phone_number and otp are required",
      });
    }

    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number.",
      });
    }

    const otpRow = await findOtp(phone_number, otp);
    if (!otpRow) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await markOtpUsed(otpRow.id);

    const user = await findUserByPhone(phone_number);

    if (!user.is_verified) {
      await updateUserVerified(user.id);
      user.is_verified = true;
    }

    const token = issueToken(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Error in loginVerifyOtp:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyAuth = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await findUserByPhone(decoded.phone_number);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Error in verifyAuth:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user; // From authMiddleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get user's farms
    const farms = await getFarmsByUser(user.id);
    
    // Get user's crops mapped to farms
    const farmCrops = await getFarmCropsByUser(user.id);

    // Get unique locations from farms
    const locations = farms.map(farm => ({
      village: farm.village_name,
      city: farm.city_name,
      district: farm.district_name,
      state: farm.state_name,
      pincode: farm.pincode,
    }));

    // Remove duplicate locations
    const uniqueLocations = locations.filter(
      (location, index, self) =>
        index === self.findIndex(
          (l) => l.village === location.village && l.pincode === location.pincode
        )
    );

    // Format crops with farm information
    const cropsWithFarms = farmCrops.map(crop => ({
      farm_crop_id: crop.farm_crop_id,
      farm_id: crop.farm_id,
      farm_name: crop.farm_name,
      crop_id: crop.crop_id,
      crop_name: crop.crop_name,
      sowing_date: crop.sowing_date,
    }));

    return res.status(200).json({
      success: true,
      profile: {
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
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user; // From authMiddleware
    // Only extract allowed fields - ignore phone_number and any other fields
    const { full_name, language } = req.body;
    
    // Get any unexpected fields to warn about
    const allowedFields = ['full_name', 'language'];
    const unexpectedFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    
    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${unexpectedFields.join(', ')}. Only full_name and language can be updated.`,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate full_name if provided
    if (full_name !== undefined) {
      if (typeof full_name !== 'string' || full_name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid full_name",
        });
      }
      const nameRegex = /^[A-Za-z ]+$/;
      if (!nameRegex.test(full_name.trim())) {
        return res.status(400).json({
          success: false,
          message: "Full name should contain only letters and spaces",
        });
      }
    }

    // Validate language if provided
    if (language !== undefined) {
      const validLanguages = ["English", "Hindi", "Marathi"];
      if (!validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language. Supported: English, Hindi, Marathi",
        });
      }
    }

    // Update user profile
    const updatedUser = await updateUserProfile(
      user.id, 
      full_name ? full_name.trim() : null, 
      language
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        language: updatedUser.language,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  registerSendOtp,
  registerVerifyOtp,
  loginSendOtp,
  loginVerifyOtp,
  logout,
  verifyAuth,
  getProfile,
  updateProfile,
};
