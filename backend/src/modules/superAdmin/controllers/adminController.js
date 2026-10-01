import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import { portalSecret } from "../../../lib/jwt.js";
import { authCookieOptions } from "../middleware/auth.js";
import { errorMessage } from "../utils/dbError.js";
import * as adminModel from "../models/adminModel.js";

export { emailExists } from "../models/adminModel.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const fail = (res, status, message, error) =>
  res.status(status).json({ success: false, message, ...(error !== undefined && { error: errorMessage(error) }) });

const isBadId = (id) => !id || isNaN(id);

// SUPER ADMIN LOGIN
export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    if (!email || !password) {
      return fail(res, 400, "Email and password are required");
    }

    const admin = await adminModel.findSuperAdminByEmail(email);
    if (!admin) {
      return fail(res, 400, "Invalid email or password");
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return fail(res, 400, "Invalid email or password");
    }

    let token;
    try {
      token = jwt.sign({ id: admin.id }, portalSecret("super-admin"), { expiresIn: "30d" });
    } catch (err) {
      return fail(res, 500, "Failed to generate token", err);
    }

    res.cookie("super_admin_token", token, { ...authCookieOptions, maxAge: THIRTY_DAYS_MS });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("SuperAdminLogin Error:", errorMessage(error));
    return fail(res, 500, "Login failed", error);
  }
};

// SUPER ADMIN LOGOUT
export const superAdminLogout = async (req, res) => {
  try {
    res.clearCookie("super_admin_token", { ...authCookieOptions, path: "/" });
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("SuperAdminLogout Error:", errorMessage(error));
    return fail(res, 500, "Logout failed", error);
  }
};

// SUPER ADMIN CHECK AUTH (reached only if authMiddleware passed)
export const checkAuth = (req, res) => {
  res.json({ authenticated: true, user: req.user || null });
};

// CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return fail(res, 400, "name, email and password are required");
    }

    if (await adminModel.emailExists(email)) {
      return fail(res, 409, "Email already exists in system");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await adminModel.createAdmin(name.trim(), email, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin,
    });
  } catch (error) {
    console.error("CreateAdmin Error:", errorMessage(error));
    return fail(res, 500, "Failed to create admin", error);
  }
};

// GET ADMINS
export const getAdmins = async (req, res) => {
  try {
    const rows = await adminModel.listAdmins();

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admins found",
        total: 0,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("GetAdmins Error:", errorMessage(error));
    return fail(res, 500, "Failed to fetch admins", error);
  }
};

// UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body || {};

  try {
    if (isBadId(id)) return fail(res, 400, "Invalid admin id");
    if (!name || !email) return fail(res, 400, "name & email are required");

    if (!(await adminModel.getAdminById(id))) {
      return fail(res, 404, "Admin not found");
    }

    await adminModel.updateAdmin(id, name, email);

    return res.status(200).json({ success: true, message: "Admin updated successfully" });
  } catch (error) {
    console.error("UpdateAdmin Error:", errorMessage(error));
    return fail(res, 500, "Failed to update admin", error);
  }
};

// DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    if (isBadId(id)) return fail(res, 400, "Invalid admin id");

    if (!(await adminModel.getAdminById(id))) {
      return fail(res, 404, "Admin not found");
    }

    await adminModel.deleteAdmin(id);

    return res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    console.error("DeleteAdmin Error:", errorMessage(error));
    return fail(res, 500, "Failed to delete admin", error);
  }
};

// BULK DELETE ADMINS
export const bulkDeleteAdmins = async (req, res) => {
  const { ids } = req.body || {};

  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return fail(res, 400, "Invalid admin ids");
    }

    const existing = await adminModel.findExistingAdminIds(ids);
    if (existing.length === 0) {
      return fail(res, 404, "No admins found with provided ids");
    }

    const deletedIds = await adminModel.bulkDeleteAdmins(ids);

    return res.status(200).json({
      success: true,
      message: "Admins deleted successfully",
      deletedCount: deletedIds.length,
      deletedIds,
    });
  } catch (error) {
    console.error("BulkDeleteAdmins Error:", errorMessage(error));
    return fail(res, 500, "Failed to delete admins", error);
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body || {};

  try {
    if (isBadId(id)) return fail(res, 400, "Invalid admin id");
    if (!newPassword) return fail(res, 400, "New password is required");

    const admin = await adminModel.getAdminById(id);
    if (!admin) return fail(res, 404, "Admin not found");

    if (await bcrypt.compare(newPassword, admin.password)) {
      return fail(res, 400, "New password cannot be same as current password");
    }

    await adminModel.updateAdminPassword(id, await bcrypt.hash(newPassword, 10));

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("UpdatePassword Error:", errorMessage(error));
    return fail(res, 500, "Failed to update password", error);
  }
};
