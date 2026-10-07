import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { portalSecret } from "../../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.website_admin_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    req.user = jwt.verify(token, portalSecret("website"));
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
