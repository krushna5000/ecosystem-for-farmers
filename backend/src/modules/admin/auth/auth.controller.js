import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { admins } from "../../../db/schema/index.js";
import { env } from "../../../config/env.js";
import { portalSecret } from "../../../utils/jwt.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body ?? {};

  try {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email ?? null));

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Admin account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      portalSecret("admin"),
      { expiresIn: "1d" },
    );

    res.cookie("adminToken", token, {
      httpOnly: true, // JS can't access cookie
      secure: false, // set true on HTTPS / production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.cause?.message || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax",
    });

    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
