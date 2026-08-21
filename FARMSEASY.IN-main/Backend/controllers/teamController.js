import pool from "../config/db.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { v4 as uuidv4 } from "uuid";

/* =========================
   CREATE TEAM MEMBER
========================= */

export const createTeamMember = async (req, res) => {
  try {
    const body = req.body || {};

    const { name, position, thoughts, sub_thoughts, is_reversed_layout } = body;

    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: "Name and position are required",
      });
    }

    const emp_id = "EMP" + uuidv4().slice(0, 6).toUpperCase();

    /* Upload image to S3 */
    const image = req.file
      ? await uploadToS3({
          file: req.file,
          folder: "team/images",
        })
      : null;

    const result = await pool.query(
      `INSERT INTO website_schema.team_members
       (emp_id, name, position, image_url, thoughts, sub_thoughts, is_reversed_layout)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        emp_id,
        name,
        position,
        image,
        thoughts || null,
        sub_thoughts || null,
        is_reversed_layout === "true" || is_reversed_layout === true,
      ]
    );

    res.status(201).json({
      success: true,
      team_member: result.rows[0],
    });
  } catch (err) {
    console.error("CREATE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET ALL TEAM MEMBERS
========================= */

export const getAllTeamMembers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM website_schema.team_members
       ORDER BY created_at ASC`
    );

    res.json({
      success: true,
      members: result.rows,
    });
  } catch (err) {
    console.error("GET TEAM MEMBERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET SINGLE TEAM MEMBER
========================= */

export const getTeamMemberById = async (req, res) => {
  try {
    const { emp_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM website_schema.team_members
       WHERE emp_id=$1`,
      [emp_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      member: result.rows[0],
    });
  } catch (err) {
    console.error("GET TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   UPDATE TEAM MEMBER
========================= */

export const updateTeamMember = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const body = req.body || {};

    const { name, position, thoughts, sub_thoughts, is_reversed_layout } = body;

    let image = null;

    if (req.file) {
      image = await uploadToS3({
        file: req.file,
        folder: "team/images",
      });
    }

    const result = await pool.query(
      `UPDATE website_schema.team_members
       SET name = COALESCE($1, name),
           position = COALESCE($2, position),
           image_url = COALESCE($3, image_url),
           thoughts = COALESCE($4, thoughts),
           sub_thoughts = COALESCE($5, sub_thoughts),
           is_reversed_layout = COALESCE($6, is_reversed_layout)
       WHERE emp_id = $7
       RETURNING *`,
      [
        name,
        position,
        image,
        thoughts,
        sub_thoughts,
        is_reversed_layout === "true" || is_reversed_layout === true,
        emp_id,
      ]
    );

    res.json({
      success: true,
      team_member: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   DELETE TEAM MEMBER
========================= */

export const deleteTeamMember = async (req, res) => {
  try {
    const { emp_id } = req.params;

    await pool.query(
      `DELETE FROM website_schema.team_members
       WHERE emp_id=$1`,
      [emp_id]
    );

    res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (err) {
    console.error("DELETE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//bulk delete

export const deleteMultipleTeamMembers = async (req, res) => {
  try {
    const { ids } = req.body;

   
    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No IDs provided",
      });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `DELETE FROM website_schema.team_members
       WHERE emp_id IN (${placeholders})`,
      ids
    );

    

    res.json({
      success: true,
      deletedCount: result.rowCount,
    });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};