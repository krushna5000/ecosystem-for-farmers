import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import { portalSecret } from "../../../lib/jwt.js";

export const generateAccessToken = (vendor) => {
  return jwt.sign(
    {
      id: vendor.id,
      email: vendor.email,
      role: "vendor",
    },
    portalSecret("vendor"),
    { expiresIn: "15m" },
  );
};

export const generateRefreshToken = (vendor) => {
  return jwt.sign({ id: vendor.id }, env.refreshSecret, { expiresIn: "7d" });
};

// JWT_RESET_SECRET is optional (falls back to the access-token secret, as before)
export const resetTokenSecret = () => process.env.JWT_RESET_SECRET || portalSecret("vendor-reset");
