import jwt from "jsonwebtoken";
import {
  findUserByPhone,
  createUser,
  updateUserVerified,
  findUserById,
} from "../models/userModel.js";
import { createOtp, findOtp, markOtpUsed } from "../models/otpModel.js";
import { generateOTP } from "../utils/otpUtils.js";

const isProduction = process.env.NODE_ENV === "production";

// function to validate mobile numbers
const validatePhoneNumber = (phone) => {
  const regex = /^(?:\+91|91)?[6-9]\d{9}$/;
  return regex.test(phone);
};

const registerSendOtp = async (req, res) => {
  try {
    const { phone_number, full_name } = req.body;

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

    await createUser(full_name.trim(), phone_number, "app");

    const otp = generateOTP();
    await createOtp(phone_number, otp);

    console.log(`Registration OTP for ${phone_number}: ${otp}`);
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

    const token = jwt.sign(
      {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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

    console.log(`Login OTP for ${phone_number}: ${otp}`);
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

    const token = jwt.sign(
      {
        id: user.id,
        phone_number: user.phone_number,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    const userId = req.user.id;

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
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
};
