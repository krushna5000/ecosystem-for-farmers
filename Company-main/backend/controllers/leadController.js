import pool from "../config/db.js";

export const getAllLeads = async (req, res) => {
  try {
    // Logged in company ID
    const companyId = req.company.id;

    const result = await pool.query(
      `
      SELECT
        l.id,
        l.phone_number,
        l.status,
        l.source,
        l.created_at,

        p.product_name

      FROM company_schema.leads l

      LEFT JOIN company_schema.products p
      ON l.product_id = p.id

      WHERE l.company_id = $1

      ORDER BY l.created_at DESC
      `,
      [companyId],
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Allowed statuses
    const allowedStatuses = ["new", "contacted", "converted"];

    // ✅ Validation
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // ✅ Update Query
    const result = await pool.query(
      `
      UPDATE company_schema.leads
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id],
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
