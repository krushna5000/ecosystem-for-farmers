// controllers/vendorController.js
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const addVendorWithDocs = async (req, res) => {
  try {
    // Text fields
    const {
      name,
      email,
      password,
      phone,
      shop_act_no,
      gst_no,
      licence_no,
      pan_no
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "name, email, phone required" });
    }

    // Check duplicates
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.vendors WHERE email=$1 OR phone=$2`,
      [email, phone]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Store file names
    const shopActPdf = req.files?.shop_act_pdf?.[0]?.filename || null;
    const gstPdf = req.files?.gst_pdf?.[0]?.filename || null;
    const licencePdf = req.files?.licence_pdf?.[0]?.filename || null;
    const panPdf = req.files?.pan_pdf?.[0]?.filename || null;

    // Hash password
    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const query = `
      INSERT INTO vendor_schema.vendors
      (name, email, password, phone,
        shop_act_no, shop_act_pdf,
        gst_no, gst_pdf,
        licence_no, licence_pdf,
        pan_no, pan_pdf)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`;

    const values = [
      name,
      email,
      hashed,
      phone,
      shop_act_no || null,
      shopActPdf,
      gst_no || null,
      gstPdf,
      licence_no || null,
      licencePdf,
      pan_no || null,
      panPdf
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("addVendorWithDocs:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------
// UPDATE Vendor WITH PDFs
// -----------------------------
export const updateVendorWithDocs = async (req, res) => {
  try {
    const { id } = req.params;

    // Text fields
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
      is_approve
    } = req.body;

    // If password included → hash it
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Uploaded PDFs (or keep existing)
    const shopActPdf = req.files?.shop_act_pdf?.[0]?.filename || null;
    const gstPdf = req.files?.gst_pdf?.[0]?.filename || null;
    const licencePdf = req.files?.licence_pdf?.[0]?.filename || null;
    const panPdf = req.files?.pan_pdf?.[0]?.filename || null;

    const query = `
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
      RETURNING *`;

    const result = await pool.query(query, [
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
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("updateVendorWithDocs:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------
// GET ALL VENDORS (WITH FULL PDF URLs)
// -------------------------------------
export const getAllVendorsWithDocs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vendor_schema.vendors ORDER BY id DESC`
    );

    // Convert PDF filenames → full URL
    const vendors = result.rows.map((vendor) => {
      return {
        ...vendor,
        shop_act_pdf: vendor.shop_act_pdf
          ? `http://localhost:5000/uploads/vendors/${vendor.shop_act_pdf}`
          : null,

        gst_pdf: vendor.gst_pdf
          ? `http://localhost:5000/uploads/vendors/${vendor.gst_pdf}`
          : null,

        licence_pdf: vendor.licence_pdf
          ? `http://localhost:5000/uploads/vendors/${vendor.licence_pdf}`
          : null,

        pan_pdf: vendor.pan_pdf
          ? `http://localhost:5000/uploads/vendors/${vendor.pan_pdf}`
          : null
      };
    });

    res.json({
      success: true,
      count: vendors.length,
      data: vendors,
    });

  } catch (err) {
    console.error("getAllVendorsWithDocs:", err.message);
    res.status(500).json({ error: err.message });
  }
};

import fs from "fs";
import path from "path";

const __dirname = path.resolve();

// Delete file helper
const deleteFileIfExists = (filename) => {
  if (!filename) return;

  const filePath = path.join(__dirname, "uploads", "vendors", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// ----------------------------------------
// DELETE VENDOR (Soft Delete + Remove PDFs)
// ----------------------------------------
export const deleteVendorWithDocs = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get vendor before deleting
    const vendorResult = await pool.query(
      `SELECT shop_act_pdf, gst_pdf, licence_pdf, pan_pdf
       FROM vendor_schema.vendors
       WHERE id = $1`,
      [id]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const vendor = vendorResult.rows[0];

    // 2. Soft delete in DB
    const result = await pool.query(
      `UPDATE vendor_schema.vendors
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // 3. Delete PDF files from uploads/vendors/
    deleteFileIfExists(vendor.shop_act_pdf);
    deleteFileIfExists(vendor.gst_pdf);
    deleteFileIfExists(vendor.licence_pdf);
    deleteFileIfExists(vendor.pan_pdf);

    res.json({
      success: true,
      message: "Vendor deleted successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("deleteVendorWithDocs:", err.message);
    res.status(500).json({ error: err.message });
  }
};
