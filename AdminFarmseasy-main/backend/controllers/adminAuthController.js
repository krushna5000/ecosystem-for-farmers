import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log(email);
  console.log(password);

  try {
    const result = await pool.query(
      "SELECT * FROM admins_schema.admins WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ message: "Admin account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // ---------------------------
    // SET JWT IN COOKIE
    // ---------------------------
    res.cookie("adminToken", token, {
      httpOnly: true, // JS can't access cookie
      secure: false, // set true on HTTPS / production
      sameSite: "lax", // important for avoiding cookie blocking
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    // Clear the cookie that stores JWT
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
