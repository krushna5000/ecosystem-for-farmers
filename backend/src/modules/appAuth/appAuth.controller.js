// Thin HTTP layer for the farmer-app auth endpoints: take the validated request, call the service, send the
// response. Owns the `token` cookie. No try/catch — Express 5 forwards rejected promises to errorHandler.
import * as appAuthService from "./appAuth.service.js";
import { sendJson } from "../../utils/response.js";
import { env } from "../../config/env.js";

const isProduction = env.isProd;

const setTokenCookie = (res, token) =>
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // localhost (HTTP)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

export async function registerSendOtp(req, res) {
  const otp = await appAuthService.registerSendOtp(req.body, req.detectedUserType); // 'app' or 'webapp'
  sendJson(res, { success: true, otp, message: "OTP sent for registration" }, 201);
}

export async function registerVerifyOtp(req, res) {
  const { token, user } = await appAuthService.registerVerifyOtp(req.body);
  setTokenCookie(res, token);
  sendJson(res, { success: true, message: "Registration completed successfully", token, user });
}

export async function loginSendOtp(req, res) {
  const otp = await appAuthService.loginSendOtp(req.body);
  sendJson(res, { success: true, otp, message: "OTP sent for login" });
}

export async function loginVerifyOtp(req, res) {
  const { token, user } = await appAuthService.loginVerifyOtp(req.body);
  setTokenCookie(res, token);
  sendJson(res, { success: true, message: "Login successful", token, user });
}

export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  sendJson(res, { success: true, message: "Logged out successfully" });
}

// Reads the cookie only (the Bearer header is accepted by the auth middleware but not here — as before).
export async function verifyAuth(req, res) {
  const user = await appAuthService.verifyAuth(req.cookies?.token);
  sendJson(res, { success: true, message: "Token is valid", user });
}

export async function getProfile(req, res) {
  const profile = await appAuthService.getProfile(req.user); // req.user: set by the auth middleware
  sendJson(res, { success: true, profile });
}

export async function updateProfile(req, res) {
  const user = await appAuthService.updateProfile(req.user.id, req.body);
  sendJson(res, { success: true, message: "Profile updated successfully", user });
}
