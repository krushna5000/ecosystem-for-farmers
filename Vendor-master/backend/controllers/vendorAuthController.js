import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtHelpers.js";
import {
  sendOTPEmail,
  sendForgotPasswordEmail,
  generateResetToken,
  generateOTP,
} from "../utils/emailHelpers.js";

export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email & Password required" });

    // Find vendor
    const result = await pool.query(
      "SELECT * FROM vendor_schema.vendors WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const vendor = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    // Generate tokens
    const accessToken = generateAccessToken(vendor);

    //Generate refresh token
    const refreshToken = generateRefreshToken(vendor);

    // Set cookies
    res.cookie("vendor_access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    //refresh token cookie
    res.cookie("vendor_refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Find vendor by email
    const result = await pool.query(
      "SELECT * FROM vendor_schema.vendors WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: "An OTP has been sent to your email.",
      });
    }

    const vendor = result.rows[0];

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database with expiration
    await pool.query(
      "INSERT INTO vendor_schema.vendor_otp (vendor_id, email, otp, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')",
      [vendor.id, email, otp],
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    const response = {
      success: true,
      message: "An OTP has been sent to your email.",
      otp: otp, // Always include OTP in response for testing
    };

    return res.status(200).json(response);
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    // Get stored OTP from database
    const otpResult = await pool.query(
      "SELECT * FROM vendor_schema.vendor_otp WHERE email = $1 AND otp = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp],
    );

    if (otpResult.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Find vendor by email
    const result = await pool.query(
      "SELECT * FROM vendor_schema.vendors WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const vendor = result.rows[0];

    // Generate reset token
    const resetToken = generateResetToken(vendor);

    // Delete OTP from database
    await pool.query(
      "DELETE FROM vendor_schema.vendor_otp WHERE email = $1 AND otp = $2",
      [email, otp],
    );

    // Send reset email
    const emailResult = await sendForgotPasswordEmail(email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send reset email" });
    }

    return res.status(200).json({
      success: true,
      message:
        "OTP verified. A password reset link has been sent to your email.",
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
    const { token, newPassword, confirmPassword } = req.body;

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

    // Verify reset token
    const secret = process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check if token is for password reset
    if (decoded.type !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const vendorId = decoded.id;

    // Find vendor
    const result = await pool.query(
      "SELECT * FROM vendor_schema.vendors WHERE id = $1",
      [vendorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const vendor = result.rows[0];

    // Check if vendor is still active and approved
    if (!vendor.is_active || !vendor.is_approve) {
      return res.status(403).json({
        success: false,
        message: "Account is not active or approved",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE vendor_schema.vendors
       SET password = $1, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, vendorId],
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Backend error during password reset" });
  }
};

export const vendorLogout = async (req, res) => {
  try {
    // Clear the vendor access token cookie
    res.clearCookie("vendor_access_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    //clear refresh token
    res.clearCookie("vendor_refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

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
    const refreshToken = req.cookies.vendor_refresh_token;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const result = await pool.query(
      "SELECT * FROM vendor_schema.vendors WHERE id = $1",
      [decoded.id],
    );

    const vendor = result.rows[0];

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const newAccessToken = generateAccessToken(vendor);

    res.cookie("vendor_access_token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid refresh token" });
  }
};
