import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { portalSecret } from "../../utils/jwt.js";

const isProduction = env.isProd;

// Cookie options shared by login/logout (cookie name: "super_admin_token").
export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

// Cookie-based auth used by every super admin route.
export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.super_admin_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    req.user = jwt.verify(token, portalSecret("super-admin"));
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Bearer-token + role check. Present in the original code but never mounted
// on any route (login tokens carry no role claim); kept for parity.
export const superAdminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, portalSecret("super-admin"));
    if (decoded.role !== "superadmin")
      return res.status(403).json({ message: "Only Super Admin allowed" });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
