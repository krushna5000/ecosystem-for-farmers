import { desc } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { crops } from "../../../db/schema/index.js";
import { snakeRows } from "../../../utils/rowCase.js";

export const getAllCrops = async (req, res) => {
  try {
    const rows = await db.select().from(crops).orderBy(desc(crops.id));

    return res.status(200).json({
      success: true,
      count: rows.length,
      crops: snakeRows(rows),
    });
  } catch (error) {
    console.error("Get Crops Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};
