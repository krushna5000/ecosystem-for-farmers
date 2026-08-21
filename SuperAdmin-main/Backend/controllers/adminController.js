import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const emailExists = async (email) => {
  try {
    const result = await pool.query(
      ` SELECT 'superadmin' AS source FROM public.super_admins WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'admin' FROM admins_schema.admins WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'vendor' FROM vendor_schema.vendors WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'company' FROM company_schema.companies WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("emailExists Error:", error);
    throw error;
  }
};


// SUPER ADMIN LOGIN
export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT * FROM super_admins WHERE email=$1",
      [email]
    );

    // Email not found
    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = result.rows[0];

    // Password mismatch
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // JWT generation
    let token;
    try {
      token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate token",
        error: err.message,
      });
    }

    // Detect environment
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // true only in production
      sameSite: isProduction ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("SuperAdminLogin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// SUPER ADMIN LOGOUT
export const superAdminLogout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  try {
    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("SuperAdminLogout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    // Check if email exists anywhere in the system
    const emailExistsInSystem = await emailExists(email);

    if (emailExistsInSystem) {
      return res.status(409).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    const result = await pool.query(
      `INSERT INTO admins_schema.admins (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("CreateAdmin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

// GET ADMINS
export const getAdmins = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email 
      FROM admins_schema.admins
      ORDER BY id ASC
    `);

    if (result.rows.length === 0) {
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
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("GetAdmins Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};

// UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    // ID validation
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin id",
      });
    }

    // Fields validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name & email are required",
      });
    }

    // Check admin exist
    const existing = await pool.query(
      "SELECT * FROM admins_schema.admins WHERE id=$1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Update query
    await pool.query(
      `UPDATE admins_schema.admins 
       SET name=$1, email=$2
       WHERE id=$3`,
      [name, email, id]
    );

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    console.error("UpdateAdmin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

// DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin id",
      });
    }

    // Check exist
    const existing = await pool.query(
      "SELECT * FROM admins_schema.admins WHERE id=$1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Delete
    await pool.query("DELETE FROM admins_schema.admins WHERE id=$1", [id]);

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("DeleteAdmin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};


export const bulkDeleteAdmins = async (req, res) => {
  const { ids } = req.body;

  try {
    // Validate IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ids",
      });
    }

    // Check if admins exist
    const existing = await pool.query(
      "SELECT id FROM admins_schema.admins WHERE id = ANY($1)",
      [ids]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No admins found with provided ids",
      });
    }

    // Delete admins
    const deleted = await pool.query(
      "DELETE FROM admins_schema.admins WHERE id = ANY($1) RETURNING id",
      [ids]
    );

    return res.status(200).json({
      success: true,
      message: "Admins deleted successfully",
      deletedCount: deleted.rowCount,
      deletedIds: deleted.rows.map((row) => row.id),
    });

  } catch (error) {
    console.error("BulkDeleteAdmins Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete admins",
      error: error.message,
    });
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // Validate required fields
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin id",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Get admin's current password hash
    const result = await pool.query(
      "SELECT password FROM admins_schema.admins WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const admin = result.rows[0];

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE admins_schema.admins SET password=$1 WHERE id=$2",
      [hashedNewPassword, id]
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("UpdatePassword Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};
