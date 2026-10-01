import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { companies } from "../../../db/schema/index.js";
import { env } from "../../../config/env.js";
import { portalSecret } from "../../../lib/jwt.js";
import { snakeKeys } from "../../../lib/rowCase.js";
import { bodyOf } from "../utils/helpers.js";

// COMPANY LOGIN
export const companyLogin = async (req, res) => {
  const { email, password } = bodyOf(req);
  try {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.email, email ?? null));

    if (!company)
      return res.status(404).json({ message: "Company does not exist" });

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    // isActive check
    if (company.isActive === false)
      return res
        .status(403)
        .json({ message: "Company account is deactivated. Please contact support." });

    // Generate JWT
    const token = jwt.sign(
      {
        id: company.id,
        email: company.email,
        type: company.companyType,
      },
      portalSecret("company"),
      { expiresIn: "7d" },
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
    console.error("Company Login Error:", error);
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
    const [company] = await db
      .select({ password: companies.password })
      .from(companies)
      .where(eq(companies.id, companyId));

    if (!company) return res.status(404).json({ message: "Company not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, company.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect old password" });

    // Hash new
    const hashed = await bcrypt.hash(newPassword, 10);

    await db
      .update(companies)
      .set({ password: hashed, updatedAt: sql`now()` })
      .where(eq(companies.id, companyId));

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PROFILE
export const getCompanyProfile = async (req, res) => {
  try {
    const [company] = await db
      .select({
        id: companies.id,
        email: companies.email,
        name: companies.name,
        logoUrl: companies.logoUrl,
        phone: companies.phone,
        gstNo: companies.gstNo,
        llpNo: companies.llpNo,
        cinNo: companies.cinNo,
      })
      .from(companies)
      .where(eq(companies.id, req.company.id));

    res.json(snakeKeys(company));
  } catch (err) {
    console.error("Get Company Profile Error:", err);
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
