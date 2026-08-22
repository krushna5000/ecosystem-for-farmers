import pool from "../config/db.js";

export const getAllCrops = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM farms_schema.crops`
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(
      `SELECT * FROM farms_schema.crops ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Crops fetched successfully",
      data: result.rows,
      pagination: {
        currentPage: page,
        limit: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get Crops Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};
