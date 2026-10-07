import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { findUserByPhone } from "../../modules/app/auth/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookie (web apps)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check for token in Authorization header (mobile/native apps)
    // Format: "Bearer <token>" or just "<token>"
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      } else {
        token = authHeader; // Use as-is if no "Bearer " prefix
      }
    }

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

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
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

export const detectUserType = (req, res, next) => {
  const clientType = req.headers["x-user-type"];
  // default is app
  req.detectedUserType = clientType === "webapp" ? "webapp" : "app";
  next();
};

export const validateFieldRequest = (req, res, next) => {
  const fieldId = req.params.fieldId || req.body?.FieldID;

  if (!fieldId) {
    return res.status(400).json({
      success: false,
      message: "Missing 'fieldId' parameter.",
    });
  }
  next();
};

export default authMiddleware;
