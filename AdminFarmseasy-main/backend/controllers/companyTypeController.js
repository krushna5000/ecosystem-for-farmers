
import pool from "../config/db.js";

export const createCompanyType = async (req, res) => {
  try {
    const { type, description } = req.body;

    const query = `
      INSERT INTO company_schema.company_types (type, description)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const result = await pool.query(query, [type, description]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating company type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET COMPANY TYPES (with pagination support)
export const getCompanyTypes = async (req, res) => {
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
        `SELECT COUNT(*) as total FROM company_schema.company_types`
      );
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const result = await pool.query(
        `SELECT * FROM company_schema.company_types ORDER BY id LIMIT $1 OFFSET $2`,
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
    const result = await pool.query(`
      SELECT * FROM company_schema.company_types ORDER BY id;
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching company types:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompanyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;

    const query = `
      UPDATE company_schema.company_types
      SET type = $1, description = $2
      WHERE id = $3
      RETURNING *;
    `;

    const result = await pool.query(query, [type, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating company type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCompanyType = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM company_schema.company_types WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Company type deleted successfully" });
  } catch (error) {
    console.error("Error deleting company type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
