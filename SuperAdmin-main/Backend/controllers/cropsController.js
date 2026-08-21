
import pool from "../config/db.js";
import helmet from "helmet";

export const securityHeaders = helmet();


export const addCrop = async (req, res) => {
  try {
    const {
      category_id,
      crop_name,
      crop_stages_id,
      t_base
    } = req.body;

    // Required fields
    if ( !category_id || !crop_name) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        error: " category_id & crop_name are required",
      });
    }

    // Validate crop_stages_id
    if (crop_stages_id && !Array.isArray(crop_stages_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop_stages_id",
        error: "crop_stages_id must be an array",
      });
    }

   
    // Validate category
    const categoryCheck = await pool.query(
      `SELECT id FROM farms_schema.crop_categories WHERE id = $1`,
      [category_id]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid category_id",
      });
    }

    const query = `
      INSERT INTO farms_schema.crops
      (category_id, crop_name, crop_stage_id, t_base)
      VALUES ($1, $2, $3 ::jsonb, $4)
      RETURNING *;
    `;

    const values = [
      category_id,
      crop_name,
      crop_stages_id ? JSON.stringify(crop_stages_id) : null,
      t_base || null
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: "Crop added successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("AddCrop Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add crop",
      error: err.message,
    });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop id",
      });
    }

    // Check crop exists
    const check = await pool.query(
      "SELECT id FROM farms_schema.crops WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // UPDATE QUERY (NO updated_at)
    const query = `
      UPDATE farms_schema.crops
      SET
        category_id = COALESCE($1, category_id),
        crop_name = COALESCE($2, crop_name),
        crop_stage_id = COALESCE($3::jsonb, crop_stage_id),
        t_base = COALESCE($4, t_base)
      WHERE id = $5
      RETURNING *;
    `;

    const values = [

      body.category_id ?? null,
      body.crop_name ?? null,
      body.crop_stages_id ? JSON.stringify(body.crop_stages_id) : null,
      body.t_base ?? null,
      id
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("updateCrop Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update crop",
      error: err.message,
    });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop id",
      });
    }

    const check = await pool.query(
      "SELECT id FROM farms_schema.crops WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    await pool.query(
      "DELETE FROM farms_schema.crops WHERE id = $1",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Crop deleted successfully",
    });

  } catch (err) {
    console.error("DeleteCrop Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete crop",
      error: err.message,
    });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM farms_schema.crops`;
    const countResult = await pool.query(countQuery);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const query = `
      SELECT
        c.id,
        c.crop_name,
        c.t_base,
        c.created_at,
        c.crop_stage_id,

        cat.id AS category_id,
        cat.category_name,

        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', s.id,
              'stage_name', s.stage_name,
              'description', s.description
            )
          )
          FILTER (WHERE s.id IS NOT NULL),
          '[]'::jsonb
        ) AS crop_stages

      FROM farms_schema.crops c

      LEFT JOIN farms_schema.crop_categories cat
        ON cat.id = c.category_id

      LEFT JOIN LATERAL (
        SELECT (e->>'id')::int AS stage_id
        FROM jsonb_array_elements(
          COALESCE(c.crop_stage_id, '[]'::jsonb)
        ) e
      ) stg ON TRUE

      LEFT JOIN farms_schema.crop_stages s
        ON s.id = stg.stage_id

      GROUP BY c.id, cat.id
      ORDER BY c.id ASC
      LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (err) {
    console.error("getAllCrops:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
      error: err.message,
    });
  }
};

// Bulk delete crops
export const bulkDeleteCrops = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop IDs",
      });
    }

    // Check if crops exist
    const check = await pool.query(
      "SELECT id FROM farms_schema.crops WHERE id = ANY($1)",
      [ids]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No crops found with provided IDs",
      });
    }

    // Delete crops
    const result = await pool.query(
      "DELETE FROM farms_schema.crops WHERE id = ANY($1) RETURNING id",
      [ids]
    );

    return res.status(200).json({
      success: true,
      message: "Crops deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.id),
    });

  } catch (err) {
    console.error("BulkDeleteCrops Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete crops",
      error: err.message,
    });
  }
};

