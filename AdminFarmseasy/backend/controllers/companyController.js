import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerifyEmail } from "../utils/sendVerifyEmail.js";
import { sendApprovedEmail } from "../utils/sendCompanyApprovedEmail.js";
import { checkEmailExists } from "../utils/checkEmailExists.js";

// ADD COMPANY
export const addCompany = async (req, res) => {
  try {
    const {
      company_type,
      llp_no,
      cin_no,
      email,
      password,
      name,
      address,
      gst_no,
      phone,
    } = req.body;

    console.log("Step 1: addCompany API started");
    console.log("Request body:", req.body);

    if (!company_type || !email || !name || !address || !gst_no || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("Step 2: Required fields validated");

    const emailCheck = await checkEmailExists(email);
    console.log("Step 3: checkEmailExists result:", emailCheck);

    if (emailCheck?.exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    const emailExists = await pool.query(
      `SELECT id FROM company_schema.companies WHERE email = $1`,
      [email]
    );
    console.log("Step 4: Local email exists check done");

    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Email already exists",
      });
    }

    const gstExists = await pool.query(
      `SELECT id FROM company_schema.companies WHERE gst_no = $1`,
      [gst_no]
    );
    console.log("Step 5: GST exists check done");

    if (gstExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        field: "gst_no",
        message: "GST number already exists",
      });
    }

    const phoneExists = await pool.query(
      `SELECT id FROM company_schema.companies WHERE phone = $1`,
      [phone]
    );
    console.log("Step 6: Phone exists check done");

    if (phoneExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        field: "phone",
        message: "Phone number already exists",
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    console.log("Step 7: Password hashed");

    const verifyToken = crypto.randomBytes(32).toString("hex");
    console.log("Step 8: Verify token generated");

    console.log("FILE:", req.file);

    const logo_url = req.file?.location || null;

    const insertResult = await pool.query(
      `INSERT INTO company_schema.companies
      (company_type, llp_no, cin_no, email, password, name, address, gst_no, phone, verify_token, logo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, company_type, email, name, address, gst_no, phone, verify_token, logo_url, created_at`,
      [
        company_type,
        llp_no || null,
        cin_no || null,
        email,
        hashedPassword,
        name,
        address,
        gst_no,
        phone,
        verifyToken,
        logo_url,
      ]
    );

    console.log("Step 9: Company inserted successfully");

    if (!process.env.BASE_URL) {
      console.error("BASE_URL missing in .env");
    }

    const verifyLink = `${process.env.BASE_URL}/email-verified/company/${verifyToken}`;
    console.log("Step 10: Verify link generated:", verifyLink);

    let emailSent = true;

    try {
      console.log("Step 11: Before sendVerifyEmail");
      await sendVerifyEmail(email, verifyLink);
      console.log("Step 12: sendVerifyEmail completed");
    } catch (emailErr) {
      emailSent = false;
      console.error("sendVerifyEmail outer catch:", emailErr.message);
      console.error(emailErr.stack);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Company registered. Verification email sent."
        : "Company registered, but verification email could not be sent.",
      data: insertResult.rows[0],
    });
  } catch (err) {
    console.error("addCompany full error:", err);
    console.error("addCompany stack:", err.stack);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// GET ALL COMPANIES
export const getAllCompanies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const hasPagination = req.query.page || req.query.limit;

    if (hasPagination) {
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM company_schema.companies`
      );
      const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT c.*, t.type AS company_type_name
       FROM company_schema.companies c
       LEFT JOIN company_schema.company_types t ON c.company_type = t.id
       ORDER BY c.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

      return res.json({
        success: true,
        data: result.rows,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const result = await pool.query(
      `SELECT c.*, t.type AS company_type_name
       FROM company_schema.companies c
       LEFT JOIN company_schema.company_types t ON c.company_type = t.id
       ORDER BY c.id DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("getAllCompanies:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// GET COMPANY BY ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, t.type AS company_type_name
       FROM company_schema.companies c
       LEFT JOIN company_schema.company_types t ON c.company_type = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("getCompanyById:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// UPDATE COMPANY
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      company_type,
      email,
      password,
      llp_no,
      cin_no,
      name,
      address,
      gst_no,
      phone,
      is_active,
      is_approved,
    } = req.body;

    // Normalize empty strings coming from the frontend so Postgres doesn't try to cast "" to INTEGER.
    const normalizedCompanyType = company_type === "" ? null : company_type;
    const normalizedEmail = email === "" ? null : email;
    const normalizedLLP = llp_no === "" ? null : llp_no;
    const normalizedCIN = cin_no === "" ? null : cin_no;
    const normalizedName = name === "" ? null : name;
    const normalizedAddress = address === "" ? null : address;
    const normalizedGST = gst_no === "" ? null : gst_no;
    const normalizedPhone = phone === "" ? null : phone;

    const logo_url = req.file?.location || null;

    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const result = await pool.query(
      `UPDATE company_schema.companies SET
        company_type = COALESCE($1, company_type),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        llp_no = COALESCE($4, llp_no),
        cin_no = COALESCE($5, cin_no),
        name = COALESCE($6, name),
        address = COALESCE($7, address),
        gst_no = COALESCE($8, gst_no),
        phone = COALESCE($9, phone),
        is_active = COALESCE($10, is_active),
        is_approved = COALESCE($11, is_approved),
        logo_url = COALESCE($12, logo_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        normalizedCompanyType,
        normalizedEmail,
        hashed ?? null,
        normalizedLLP,
        normalizedCIN,
        normalizedName,
        normalizedAddress,
        normalizedGST,
        normalizedPhone,
        typeof is_active === "boolean" ? is_active : null,
        typeof is_approved === "boolean" ? is_approved : null,
         logo_url,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateCompany:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// DELETE COMPANY
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM company_schema.companies
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company deleted permanently",
      deleted_company: result.rows[0],
    });
  } catch (err) {
    console.error("deleteCompany:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// TOGGLE COMPANY ACTIVE
export const toggleCompanyActive = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await pool.query(
      `SELECT is_active FROM company_schema.companies WHERE id = $1`,
      [id]
    );

    if (company.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const newStatus = !company.rows[0].is_active;

    const result = await pool.query(
      `UPDATE company_schema.companies
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, is_active`,
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Company is now ${newStatus ? "ACTIVE" : "INACTIVE"}`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("toggleCompanyActive:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// RESET COMPANY PASSWORD
export const resetCompanyPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE company_schema.companies
       SET password = $1,
           verify_token = NULL
       WHERE verify_token = $2
       RETURNING id, email`,
      [hashedPassword, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("resetCompanyPassword:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// VERIFY COMPANY EMAIL
export const verifyCompanyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `UPDATE company_schema.companies
       SET is_approved = TRUE,
           verify_token = $2
       WHERE verify_token = $1
       RETURNING email, name`,
      [token, resetToken]
    );

    if (result.rows.length > 0) {
      const company = result.rows[0];

      let approvedEmailSent = true;

      try {
        await sendApprovedEmail(
          company.email,
          company.name,
          company.email,
          "company"
        );
      } catch (emailErr) {
        approvedEmailSent = false;
        console.error("sendApprovedEmail failed:", emailErr.message);
        console.error(emailErr.stack);
      }

      return res.json({
        success: true,
        message: approvedEmailSent
          ? "Email verified successfully. Approval email sent."
          : "Email verified, but approved email could not be sent.",
        token: resetToken,
      });
    }

    const findByToken = await pool.query(
      `SELECT email, name, is_approved, verify_token FROM company_schema.companies 
       WHERE verify_token = $1`,
      [token]
    );

    if (findByToken.rows.length > 0) {
      return res.json({
        success: true,
        message: "Email already verified.",
        token: findByToken.rows[0].verify_token,
      });
    }

    const alreadyVerified = await pool.query(
      `SELECT email, name, verify_token FROM company_schema.companies 
       WHERE is_approved = TRUE
       ORDER BY id DESC
       LIMIT 1`
    );

    if (alreadyVerified.rows.length > 0) {
      const currentToken = alreadyVerified.rows[0].verify_token;
      return res.json({
        success: true,
        message: "Email already verified.",
        token: currentToken,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  } catch (err) {
    console.error("verifyCompanyEmail:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};


// Bulk-delete company
export const bulkDeleteCompanies = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of company IDs to delete",
      });
    }

    const deletedResult = await pool.query(
      `DELETE FROM company_schema.companies
       WHERE id = ANY($1)
       RETURNING id, name, email`,
      [ids]
    );

    if (deletedResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No companies found with the provided IDs",
      });
    }

    res.json({
      success: true,
      message: `${deletedResult.rowCount} company(ies) deleted permanently`,
      deletedCount: deletedResult.rowCount,
      deletedCompanies: deletedResult.rows,
    });

  } catch (err) {
    console.error("bulkDeleteCompanies:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};