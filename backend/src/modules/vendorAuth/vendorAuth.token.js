// Module-private credential helpers for vendorAuth: JWTs (access / refresh / password-reset) and OTP codes.
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { portalSecret } from "../../utils/jwt.js";

export const generateAccessToken = (vendor) =>
  jwt.sign({ id: vendor.id, email: vendor.email, role: "vendor" }, portalSecret("vendor"), { expiresIn: "15m" });

export const generateRefreshToken = (vendor) =>
  jwt.sign({ id: vendor.id }, env.refreshSecret, { expiresIn: "7d" });

// JWT_RESET_SECRET is optional (falls back to the access-token secret, as before)
export const resetTokenSecret = () => process.env.JWT_RESET_SECRET || portalSecret("vendor-reset");

export const generateResetToken = (vendor) =>
  jwt.sign({ id: vendor.id, email: vendor.email, type: "password_reset" }, resetTokenSecret(), {
    expiresIn: "1h",
  });

/** Throws (JsonWebTokenError / TokenExpiredError) when the token is invalid. */
export const verifyResetToken = (token) => jwt.verify(token, resetTokenSecret());

/** Throws (JsonWebTokenError / TokenExpiredError) when the token is invalid. */
export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret);

export const generateOTP = () => crypto.randomInt(100000, 1000000).toString();
