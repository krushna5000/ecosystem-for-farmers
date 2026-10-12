// Thin HTTP layer: take the request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as websiteAdminService from "./websiteAdmin.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys } from "../../utils/rowCase.js";

const COOKIE_NAME = "website_admin_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // change to true in production
  sameSite: "lax",
};
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function registerAdmin(req, res) {
  const admin = await websiteAdminService.registerAdmin(req.body ?? {});
  sendJson(res, { message: "Admin registered successfully", admin: snakeKeys(admin) }, 201);
}

export async function loginAdmin(req, res) {
  const token = await websiteAdminService.loginAdmin(req.body ?? {});
  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: SESSION_MAX_AGE_MS });
  sendJson(res, { success: true, message: "Login successful" });
}

export function adminLogout(req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  sendJson(res, { success: true, message: "Logout successful" });
}

export function checkAuth(req, res) {
  sendJson(res, { authenticated: true, user: req.user || null });
}
