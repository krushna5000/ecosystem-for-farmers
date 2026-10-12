// Business rules for vendor authentication and password reset. Throws AppError subclasses; never touches
// req/res (cookies are the controller's job) or the database directly.
import bcrypt from "bcryptjs";
import {
  getVendorByEmailInDB,
  getVendorByIdInDB,
  updateVendorPasswordInDB,
  createVendorOtpInDB,
  getValidVendorOtpInDB,
  deleteVendorOtpInDB,
} from "./vendorAuth.factory.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateOTP,
  verifyResetToken,
  verifyRefreshToken,
} from "./vendorAuth.token.js";
import { sendOTPEmail, sendForgotPasswordEmail } from "./vendorAuth.email.js";
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/index.js";

// These auth endpoints always answered `{ success, message }`, also on 5xx — keep the message in production.
const mailFailure = (message) => new AppError(message, 500, { body: { success: false, message } });

export async function loginVendor({ email, password }) {
  const vendor = await getVendorByEmailInDB(email);
  if (!vendor) throw new UnauthorizedError("Invalid email or password");

  const isMatch = await bcrypt.compare(password, vendor.password);
  if (!isMatch) throw new UnauthorizedError("Invalid email or password");

  return {
    vendor: { id: vendor.id, name: vendor.name, email: vendor.email },
    accessToken: generateAccessToken(vendor),
    refreshToken: generateRefreshToken(vendor),
  };
}

/**
 * Emails a 5-minute OTP. Returns the OTP (the old API always echoed it "for testing"), or null when the
 * address is unknown — the caller must not reveal whether an email exists.
 */
export async function requestPasswordReset(email) {
  const vendor = await getVendorByEmailInDB(email);
  if (!vendor) return null;

  const otp = generateOTP();
  await createVendorOtpInDB({ vendorId: vendor.id, email, otp });

  const emailResult = await sendOTPEmail(email, otp);
  if (!emailResult.success) {
    console.error("Failed to send OTP email:", emailResult.error);
    throw mailFailure("Failed to send OTP email");
  }
  return otp;
}

/** Consumes the OTP and emails a one-hour password-reset link. */
export async function verifyPasswordResetOtp(email, otp) {
  const stored = await getValidVendorOtpInDB(email, otp);
  if (!stored) throw new UnauthorizedError("Invalid or expired OTP");

  const vendor = await getVendorByEmailInDB(email);
  if (!vendor) throw new NotFoundError("Vendor not found");

  const resetToken = generateResetToken(vendor);

  await deleteVendorOtpInDB(email, otp);

  const emailResult = await sendForgotPasswordEmail(email, resetToken);
  if (!emailResult.success) {
    console.error("Failed to send reset email:", emailResult.error);
    throw mailFailure("Failed to send reset email");
  }
}

export async function resetVendorPassword(token, newPassword) {
  let decoded;
  try {
    decoded = verifyResetToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  if (decoded.type !== "password_reset") throw new UnauthorizedError("Invalid reset token");

  const vendor = await getVendorByIdInDB(decoded.id);
  if (!vendor) throw new NotFoundError("Vendor not found");

  if (!vendor.isActive || !vendor.isApprove) {
    throw new ForbiddenError("Account is not active or approved");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateVendorPasswordInDB(decoded.id, hashedPassword);
}

/** Issues a fresh access token for a valid refresh token. */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw new UnauthorizedError("No refresh token");

  // The old handler answered 403 for anything that went wrong while verifying / looking the vendor up.
  let vendor;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    vendor = await getVendorByIdInDB(decoded.id);
  } catch {
    throw new ForbiddenError("Invalid refresh token");
  }

  if (!vendor) throw new NotFoundError("Vendor not found");

  return generateAccessToken(vendor);
}
