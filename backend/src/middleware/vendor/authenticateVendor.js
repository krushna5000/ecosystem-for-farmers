import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { portalSecret } from "../../utils/jwt.js";

export const authenticateVendor = (req, res, next) => {
  const token =
    req.cookies?.vendor_access_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, portalSecret("vendor"));
    req.vendor = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
