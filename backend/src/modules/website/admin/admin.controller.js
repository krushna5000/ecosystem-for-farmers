import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { websiteAdmin } from "../../../db/schema/index.js";
import { env } from "../../../config/env.js";
import { portalSecret } from "../../../utils/jwt.js";
import { snakeKeys } from "../../../utils/rowCase.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // change to true in production
  sameSite: "lax",
};

export const registerAdmin = async (req, res) => {
  const { admin_name, email, password } = req.body || {};

  try {
    if (!admin_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await db
      .select({ adminId: websiteAdmin.adminId })
      .from(websiteAdmin)
      .where(eq(websiteAdmin.email, email));

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [admin] = await db
      .insert(websiteAdmin)
      .values({
        adminId: crypto.randomUUID(),
        adminName: admin_name,
        email,
        passwordHash,
      })
      .returning({
        adminId: websiteAdmin.adminId,
        adminName: websiteAdmin.adminName,
        email: websiteAdmin.email,
      });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: snakeKeys(admin),
    });
  } catch (err) {
    console.error("Admin Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const [admin] = await db
      .select()
      .from(websiteAdmin)
      .where(eq(websiteAdmin.email, String(email ?? "")));

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);

    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { admin_id: admin.adminId, email: admin.email },
      portalSecret("website"),
      { expiresIn: "7d" },
    );

    res.cookie("website_admin_token", token, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("website_admin_token", COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

export const checkAuth = (req, res) => {
  res.json({ authenticated: true, user: req.user || null });
};
