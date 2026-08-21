
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const addCompany = async (req, res) => {
  try {
    const {
      company_type,
      email,
      password,
      llp_no,
      cin_no,
      name,
      address,
      gst_no,
      phone
    } = req.body;

    if (!company_type || !email || !name || !address || !gst_no || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await pool.query(
      `SELECT id FROM company_schema.companies 
       WHERE email=$1 OR gst_no=$2 OR phone=$3`,
      [email, gst_no, phone]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "Company email, gst_no or phone already exists",
      });
    }

    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const result = await pool.query(
      `INSERT INTO company_schema.companies
        (company_type, email, password, llp_no, cin_no, name, address, gst_no, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        company_type,
        email,
        hashed,
        llp_no || null,
        cin_no || null,
        name,
        address,
        gst_no,
        phone
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error("addCompany:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, t.type AS company_type_name
       FROM company_schema.companies c
       LEFT JOIN company_schema.company_types t
       ON c.company_type = t.id
       ORDER BY c.id DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllCompanies:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*, t.type AS company_type_name
       FROM company_schema.companies c
       LEFT JOIN company_schema.company_types t
       ON c.company_type = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error("getCompanyById:", err.message);
    res.status(500).json({ error: err.message });
  }
};


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
      is_approved
    } = req.body;

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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        company_type || null,
        email || null,
        hashed || null,
        llp_no || null,
        cin_no || null,
        name || null,
        address || null,
        gst_no || null,
        phone || null,
        typeof is_active === "boolean" ? is_active : null,
        typeof is_approved === "boolean" ? is_approved : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error("updateCompany:", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE company_schema.companies
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      success: true,
      message: "Company deleted successfully",
      deleted_company: result.rows[0]   // optional
    });

  } catch (err) {
    console.error("deleteCompany:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
