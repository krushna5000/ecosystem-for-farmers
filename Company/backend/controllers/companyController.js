import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// COMPANY LOGIN
export const companyLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM company_schema.companies WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Company does not exist" });

    const company = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    // isActive check
    if (company.is_active === false)
      return res
        .status(403)
        .json({ message: "Company account is deactivated. Please contact support." });

    // Generate JWT
    const token = jwt.sign(
      {
        id: company.id,
        email: company.email,
        type: company.company_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save token in HTTP-Only Cookie
    res.cookie("company_token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PASSWORD
export const updatePassword = async (req, res) => {
  const companyId = req.company.id;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body cannot be empty",
    });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "oldPassword and newPassword are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM company_schema.companies WHERE id=$1",
      [companyId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Company not found" });

    const company = result.rows[0];

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, company.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect old password" });

    // Hash new
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE company_schema.companies 
       SET password=$1, updated_at=NOW() 
       WHERE id=$2`,
      [hashed, companyId]
    );

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PROFILE
export const getCompanyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, logo_url, phone, gst_no, llp_no, cin_no FROM company_schema.companies WHERE id=$1",
      [req.company.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// COMPANY LOGOUT
export const companyLogout = async (req, res) => {
  try {
    res.clearCookie("company_token", {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Company Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

