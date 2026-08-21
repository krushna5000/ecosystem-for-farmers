import pool from "../config/db.js";

export const getAllCrops = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM farms_schema.crops ORDER BY id DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      crops: result.rows,
    });

  } catch (error) {
    console.error("Get Crops Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};