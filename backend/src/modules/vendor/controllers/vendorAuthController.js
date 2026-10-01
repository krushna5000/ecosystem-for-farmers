import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { env } from "../../../config/env.js";
import { vendors, vendorOtp } from "../../../db/schema/index.js";
import { generateAccessToken, generateRefreshToken, resetTokenSecret } from "../utils/jwtHelpers.js";
import {
  sendOTPEmail,
  sendForgotPasswordEmail,
  generateResetToken,
  generateOTP,
} from "../utils/emailHelpers.js";
import { now } from "../utils/helpers.js";

const cookieOptions = { httpOnly: true, secure: false, sameSite: "lax" };

const findVendorByEmail = async (email) => {
  const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
  return vendor;
};

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email & Password required" });

    const vendor = await findVendorByEmail(email);

    if (!vendor)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const accessToken = generateAccessToken(vendor);
    const refreshToken = generateRefreshToken(vendor);

    res.cookie("vendor_access_token", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("vendor_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
      },
    });
  } catch (error) {
    console.error("Vendor Login Error:", error);
    res.status(500).json({ success: false, message: "Error during login" });
  }
};

export const checkAuth = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  res.json({
    authenticated: true,
    user: req.vendor || null,
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const vendor = await findVendorByEmail(email);

    if (!vendor) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: "An OTP has been sent to your email.",
      });
    }

    const otp = generateOTP();

    await db.insert(vendorOtp).values({
      vendorId: vendor.id,
      email,
      otp,
      expiresAt: sql`NOW() + INTERVAL '5 minutes'`,
    });

    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "An OTP has been sent to your email.",
      otp, // kept from the old API (always returned "for testing")
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Backend error during password reset request",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const [stored] = await db
      .select()
      .from(vendorOtp)
      .where(and(eq(vendorOtp.email, email), eq(vendorOtp.otp, otp), gt(vendorOtp.expiresAt, now())))
      .orderBy(desc(vendorOtp.createdAt))
      .limit(1);

    if (!stored) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    const vendor = await findVendorByEmail(email);

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const resetToken = generateResetToken(vendor);

    await db.delete(vendorOtp).where(and(eq(vendorOtp.email, email), eq(vendorOtp.otp, otp)));

    const emailResult = await sendForgotPasswordEmail(email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return res.status(500).json({ success: false, message: "Failed to send reset email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified. A password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Backend error during OTP verification",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body ?? {};

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, resetTokenSecret());
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.type !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const vendorId = decoded.id;

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (!vendor.isActive || !vendor.isApprove) {
      return res.status(403).json({
        success: false,
        message: "Account is not active or approved",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(vendors)
      .set({ password: hashedPassword, updatedAt: now() })
      .where(eq(vendors.id, vendorId));

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Backend error during password reset" });
  }
};

export const vendorLogout = async (req, res) => {
  try {
    res.clearCookie("vendor_access_token", cookieOptions);
    res.clearCookie("vendor_refresh_token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Vendor Logout Error:", error);
    res.status(500).json({ success: false, message: "Error during logout" });
  }
};

export const refreshVendorToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.vendor_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, env.refreshSecret);

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, decoded.id));

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const newAccessToken = generateAccessToken(vendor);

    res.cookie("vendor_access_token", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};
