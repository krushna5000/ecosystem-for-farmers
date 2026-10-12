// Thin HTTP layer: take the validated request, call the service, send the response. Cookies and cache
// headers are HTTP concerns and live here. Rejections are left to Express 5, which forwards them to
// middleware/errorHandler.js.
import * as vendorAuthService from "./vendorAuth.service.js";
import { sendJson } from "../../utils/response.js";

const cookieOptions = { httpOnly: true, secure: false, sameSite: "lax" };
const ACCESS_COOKIE = "vendor_access_token";
const REFRESH_COOKIE = "vendor_refresh_token";
const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Every auth body is bespoke (`{ success, message, ... }` without `data`), so they all go through sendJson.

export async function vendorLogin(req, res) {
  const { vendor, accessToken, refreshToken } = await vendorAuthService.loginVendor(req.body);

  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });

  sendJson(res, { success: true, message: "Login successful", vendor });
}

export function checkAuth(req, res) {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  sendJson(res, { authenticated: true, user: req.vendor || null });
}

export async function forgotPassword(req, res) {
  const otp = await vendorAuthService.requestPasswordReset(req.body.email);

  const body = { success: true, message: "An OTP has been sent to your email." };
  if (otp) body.otp = otp; // kept from the old API (always returned "for testing")
  sendJson(res, body);
}

export async function verifyOTP(req, res) {
  await vendorAuthService.verifyPasswordResetOtp(req.body.email, req.body.otp);

  sendJson(res, {
    success: true,
    message: "OTP verified. A password reset link has been sent to your email.",
  });
}

export async function resetPassword(req, res) {
  await vendorAuthService.resetVendorPassword(req.body.token, req.body.newPassword);

  sendJson(res, { success: true, message: "Password reset successfully" });
}

export function vendorLogout(req, res) {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
  res.clearCookie(REFRESH_COOKIE, cookieOptions);

  sendJson(res, { success: true, message: "Logout successful" });
}

export async function refreshVendorToken(req, res) {
  const accessToken = await vendorAuthService.refreshAccessToken(req.cookies?.[REFRESH_COOKIE]);

  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });

  sendJson(res, { success: true });
}
