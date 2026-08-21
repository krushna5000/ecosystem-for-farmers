import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { sendVerifyEmail } from "../utils/sendVerifyEmail.js";
import { sendApprovedEmail } from "../utils/sendCompanyApprovedEmail.js";
import { checkEmailExists } from "../utils/checkEmailExists.js";
import { deleteS3File } from "../utils/s3Upload.js";

// ADD Vendor WITH PDFs
 
export const addVendorWithDocs = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      shop_act_no,
      gst_no,
      licence_no,
      pan_no,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    const exists = await pool.query(
      `SELECT id FROM vendor_schema.vendors 
       WHERE email = $1 OR phone = $2`,
      [email, phone]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Vendor email or phone already exists",
      });
    }

    const shopActPdf = req.files?.shop_act_pdf?.[0]?.location || null;
    const gstPdf = req.files?.gst_pdf?.[0]?.location || null;
    const licencePdf = req.files?.licence_pdf?.[0]?.location || null;
    const panPdf = req.files?.pan_pdf?.[0]?.location || null;

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const query = `
      INSERT INTO vendor_schema.vendors
      (
        name, email, password, phone,
        shop_act_no, shop_act_pdf,
        gst_no, gst_pdf,
        licence_no, licence_pdf,
        pan_no, pan_pdf,
        verify_token, is_active, is_approve
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false,false)
      RETURNING *
    `;

    const values = [
      name,
      email,
      hashedPassword,
      phone,
      shop_act_no || null,
      shopActPdf,
      gst_no || null,
      gstPdf,
      licence_no || null,
      licencePdf,
      pan_no || null,
      panPdf,
      verifyToken,
    ];

    const result = await pool.query(query, values);
    const vendor = result.rows[0];

    const verifyLink = `${process.env.BASE_URL}/email-verified/vendor/${verifyToken}`;

    await sendVerifyEmail(email, verifyLink);

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Verification email sent.",
      data: vendor,
    });

  } catch (err) {
    console.error("addVendorWithDocs:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE Vendor WITH PDFs
 export const updateVendorWithDocs = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      name,
      email,
      password,
      phone,
      shop_act_no,
      gst_no,
      licence_no,
      pan_no,
      is_active,
      is_approve,
    } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const shopActPdf = req.files?.shop_act_pdf?.[0]?.location || null;
    const gstPdf = req.files?.gst_pdf?.[0]?.location || null;
    const licencePdf = req.files?.licence_pdf?.[0]?.location || null;
    const panPdf = req.files?.pan_pdf?.[0]?.location || null;

    const result = await pool.query(
      `
      UPDATE vendor_schema.vendors SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        phone = COALESCE($4, phone),
        shop_act_no = COALESCE($5, shop_act_no),
        shop_act_pdf = COALESCE($6, shop_act_pdf),
        gst_no = COALESCE($7, gst_no),
        gst_pdf = COALESCE($8, gst_pdf),
        licence_no = COALESCE($9, licence_no),
        licence_pdf = COALESCE($10, licence_pdf),
        pan_no = COALESCE($11, pan_no),
        pan_pdf = COALESCE($12, pan_pdf),
        is_active = COALESCE($13, is_active),
        is_approve = COALESCE($14, is_approve),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `,
      [
        name || null,
        email || null,
        hashedPassword || null,
        phone || null,
        shop_act_no || null,
        shopActPdf,
        gst_no || null,
        gstPdf,
        licence_no || null,
        licencePdf,
        pan_no || null,
        panPdf,
        typeof is_active === "boolean" ? is_active : null,
        typeof is_approve === "boolean" ? is_approve : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.json({
      success: true,
      message: "Vendor updated successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("updateVendorWithDocs:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL Vendors (with pagination support)
export const getAllVendorsWithDocs = async (req, res) => {
  try {
    // Get pagination params from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // If page and limit are provided, use pagination
    const hasPagination = req.query.page || req.query.limit;

    if (hasPagination) {
      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM vendor_schema.vendors`
      );
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const result = await pool.query(
        `SELECT * FROM vendor_schema.vendors ORDER BY id DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return res.json({
        success: true,
        data: result.rows,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      });
    }

    // Original behavior - return all data (backward compatible)
    const result = await pool.query(
      `SELECT * FROM vendor_schema.vendors ORDER BY id DESC`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (err) {
    console.error("getAllVendorsWithDocs:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// DELETE VENDOR (PERMANENT DELETE)
 export const deleteVendorWithDocs = async (req, res) => {
  try {

    const { id } = req.params;

    const vendorResult = await pool.query(
      `SELECT * FROM vendor_schema.vendors WHERE id = $1`,
      [id]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const vendor = vendorResult.rows[0];

    const result = await pool.query(
      `DELETE FROM vendor_schema.vendors
       WHERE id = $1
       RETURNING id,name,email`,
      [id]
    );

    if (vendor.shop_act_pdf) await deleteS3File(vendor.shop_act_pdf);
    if (vendor.gst_pdf) await deleteS3File(vendor.gst_pdf);
    if (vendor.licence_pdf) await deleteS3File(vendor.licence_pdf);
    if (vendor.pan_pdf) await deleteS3File(vendor.pan_pdf);

    return res.json({
      success: true,
      message: "Vendor deleted permanently",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("deleteVendorWithDocs:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// TOGGLE Vendor Active / Inactive
 export const toggleVendorActive = async (req, res) => {
  try {

    const { id } = req.params;

    const vendor = await pool.query(
      `SELECT is_active FROM vendor_schema.vendors WHERE id = $1`,
      [id]
    );

    if (vendor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const newStatus = !vendor.rows[0].is_active;

    const result = await pool.query(
      `UPDATE vendor_schema.vendors
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id,name,email,is_active`,
      [newStatus, id]
    );

    return res.json({
      success: true,
      message: `Vendor is now ${newStatus ? "ACTIVE" : "INACTIVE"}`,
      data: result.rows[0],
    });

  } catch (err) {
    console.error("toggleVendorActive:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// VERIFY Vendor Email
export const verifyVendorEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // First, try to verify with the token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `UPDATE vendor_schema.vendors
       SET is_active = TRUE,
           is_approve = TRUE,
           verify_token = $2
       WHERE verify_token = $1
       RETURNING email,name`,
      [token, resetToken]
    );

    // If token was valid and verification succeeded
    if (result.rowCount > 0) {
      const vendor = result.rows[0];
      const resetLink = `${process.env.BASE_URL}/reset-password/vendor/${resetToken}`;

      await sendApprovedEmail(
        vendor.email,
        vendor.name,
        vendor.email,
        resetLink,
        "vendor"
      );

      return res.json({
        success: true,
        message: "Email verified. Please set your password.",
        token: resetToken,
      });
    }

    // If token was invalid, check if already verified
    const findByToken = await pool.query(
      `SELECT email, name, is_approve, verify_token FROM vendor_schema.vendors 
       WHERE verify_token = $1`,
      [token]
    );

    if (findByToken.rows.length > 0) {
      // Token exists but wasn't matched in update - return success
      return res.json({
        success: true,
        message: "Email already verified.",
        token: findByToken.rows[0].verify_token,
      });
    }

    // Check if already verified - if yes, get the current valid token
    const alreadyVerified = await pool.query(
      `SELECT email, name, verify_token FROM vendor_schema.vendors 
       WHERE is_approve = TRUE
       ORDER BY id DESC
       LIMIT 1`
    );

    if (alreadyVerified.rows.length > 0) {
      const currentToken = alreadyVerified.rows[0].verify_token;
      return res.json({
        success: true,
        message: "Email already verified. You can set your password.",
        token: currentToken,
      });
    }

    // Token is truly invalid
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  } catch (err) {
    console.error("verifyVendorEmail:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};


// RESET Vendor Password
 export const resetVendorPassword = async (req, res) => {
  try {

    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE vendor_schema.vendors
       SET password = $1,
           verify_token = NULL
       WHERE verify_token = $2
       RETURNING id,email`,
      [hashedPassword, token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    return res.json({
      success: true,
      message: "Vendor password reset successfully",
    });

  } catch (err) {
    console.error("resetVendorPassword:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// BULK DELETE VENDORS
export const bulkDeleteVendors = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of vendor IDs to delete",
      });
    }

    // Get vendors to delete (for S3 file cleanup)
    const vendorsToDelete = await pool.query(
      `SELECT id, name, email, shop_act_pdf, gst_pdf, licence_pdf, pan_pdf 
       FROM vendor_schema.vendors WHERE id = ANY($1)`,
      [ids]
    );

    if (vendorsToDelete.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors found with the provided IDs",
      });
    }

    // Delete vendors from database
    const deletedResult = await pool.query(
      `DELETE FROM vendor_schema.vendors WHERE id = ANY($1) RETURNING id, name, email`,
      [ids]
    );

    // Delete associated S3 files
    for (const vendor of vendorsToDelete.rows) {
      if (vendor.shop_act_pdf) await deleteS3File(vendor.shop_act_pdf);
      if (vendor.gst_pdf) await deleteS3File(vendor.gst_pdf);
      if (vendor.licence_pdf) await deleteS3File(vendor.licence_pdf);
      if (vendor.pan_pdf) await deleteS3File(vendor.pan_pdf);
    }

    return res.json({
      success: true,
      message: `${deletedResult.rowCount} vendor(s) deleted permanently`,
      deletedCount: deletedResult.rowCount,
      deletedVendors: deletedResult.rows,
    });

  } catch (err) {
    console.error("bulkDeleteVendors:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

