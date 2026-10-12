// Thin HTTP layer for the admin login/session endpoints. Owns the auth cookie.
import * as adminAuthService from "./adminAuth.service.js";
import { sendJson } from "../../utils/response.js";

const COOKIE_NAME = "adminToken";

const cookieOptions = {
  httpOnly: true, // JS can't read the cookie
  secure: false, // set true on HTTPS / production
  sameSite: "lax",
};

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  const token = await adminAuthService.loginAdmin(email, password);

  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  sendJson(res, { success: true, message: "Login successful" });
}

export function adminLogout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  sendJson(res, { success: true, message: "Logout successful" });
}

export function getDashboard(req, res) {
  sendJson(res, { success: true, message: "Admin Dashboard", admin: req.admin });
}

export function checkAuth(req, res) {
  sendJson(res, { success: true, admin: req.admin });
}
