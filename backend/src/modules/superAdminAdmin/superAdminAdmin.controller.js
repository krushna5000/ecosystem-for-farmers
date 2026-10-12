// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not handled here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as superAdminAdminService from "./superAdminAdmin.service.js";
import { sendCreated, sendJson } from "../../utils/response.js";
import { authCookieOptions } from "../../middleware/superAdminAuth.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function superAdminLogin(req, res) {
  const { email, password } = req.body;
  const token = await superAdminAdminService.loginSuperAdmin(email, password);

  res.cookie("super_admin_token", token, { ...authCookieOptions, maxAge: THIRTY_DAYS_MS });
  sendJson(res, { success: true, message: "Login successful" });
}

export function superAdminLogout(req, res) {
  res.clearCookie("super_admin_token", { ...authCookieOptions, path: "/" });
  sendJson(res, { success: true, message: "Logout successful" });
}

// Reached only if authMiddleware passed.
export function checkAuth(req, res) {
  sendJson(res, { authenticated: true, user: req.user || null });
}

export async function createAdmin(req, res) {
  const admin = await superAdminAdminService.createAdmin(req.body);
  sendCreated(res, admin, "Admin created successfully");
}

export async function getAdmins(req, res) {
  const rows = await superAdminAdminService.listAdmins();
  const message = rows.length === 0 ? "No admins found" : "Admins fetched successfully";
  sendJson(res, { success: true, message, total: rows.length, data: rows });
}

export async function updateAdmin(req, res) {
  await superAdminAdminService.updateAdmin(req.params.id, req.body);
  sendJson(res, { success: true, message: "Admin updated successfully" });
}

export async function deleteAdmin(req, res) {
  await superAdminAdminService.deleteAdmin(req.params.id);
  sendJson(res, { success: true, message: "Admin deleted successfully" });
}

export async function bulkDeleteAdmins(req, res) {
  const { deletedCount, deletedIds } = await superAdminAdminService.bulkDeleteAdmins(req.body.ids);
  sendJson(res, { success: true, message: "Admins deleted successfully", deletedCount, deletedIds });
}

export async function updatePassword(req, res) {
  await superAdminAdminService.updateAdminPassword(req.params.id, req.body.newPassword);
  sendJson(res, { success: true, message: "Password updated successfully" });
}
