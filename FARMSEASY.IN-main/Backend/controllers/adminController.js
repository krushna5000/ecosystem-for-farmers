import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



// Register New Admin
export const registerAdmin = async (req, res) => {
  const { admin_name, email, password } = req.body;

  try {
    if (!admin_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailCheck = await pool.query(
      `SELECT admin_id FROM website_schema.admin WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO website_schema.admin 
        (admin_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING admin_id, admin_name, email`,
      [admin_name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Admin registered successfully",
      admin: result.rows[0],
    });

  } catch (err) {
    console.error("Admin Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Admin Login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminData = await pool.query(
      `SELECT * FROM website_schema.admin WHERE email = $1`,
      [email]
    );

    if (adminData.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = adminData.rows[0];

    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store token in cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,      // change to true in production
      sameSite: "lax",
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
    // Clear cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: false, // change to true in production/https
      sameSite: "lax",
    });

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


// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  const { admin_id } = req.user;

  try {
    const result = await pool.query(
      `SELECT admin_id, admin_name, email, is_active, created_at
       FROM website_schema.admin WHERE admin_id = $1`,
      [admin_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Fetch Admin Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Update Admin
export const updateAdmin = async (req, res) => {
  const { admin_id } = req.user;
  const { admin_name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE website_schema.admin 
       SET admin_name = $1, updated_at = NOW()
       WHERE admin_id = $2
       RETURNING admin_id, admin_name, email`,
      [admin_name, admin_id]
    );

    res.json({
      message: "Admin updated successfully",
      admin: result.rows[0],
    });

  } catch (err) {
    console.error("Update Admin Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Delete Admin
export const deleteAdmin = async (req, res) => {
  const { admin_id } = req.user;

  try {
    await pool.query(
      `DELETE FROM website_schema.admin WHERE admin_id = $1`,
      [admin_id]
    );

    res.json({ message: "Admin deleted successfully" });

  } catch (err) {
    console.error("Delete Admin Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
