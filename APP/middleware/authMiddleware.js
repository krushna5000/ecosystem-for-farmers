import jwt from "jsonwebtoken";
import { findUserByPhone } from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
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

export const validateFieldRequest = (req, res, next) => {
    const fieldId = req.params.fieldId || req.body.FieldID;
   //  console.log("Validating request for fieldId:", fieldId);

    if (!fieldId) {
        return res.status(400).json({
            success: false,
            message: "Missing 'fieldId' parameter."
        });
    }
    next();
};

export default authMiddleware;
