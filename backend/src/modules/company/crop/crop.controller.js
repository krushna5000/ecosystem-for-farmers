import { count, desc } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { crops } from "../../../db/schema/index.js";
import { snakeRows } from "../../../utils/rowCase.js";
import { getPagination, getPaginationMeta } from "../../../utils/company/pagination.util.js";

export const getAllCrops = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req);

    const [{ value: totalItems }] = await db.select({ value: count() }).from(crops);

    const rows = await db
      .select()
      .from(crops)
      .orderBy(desc(crops.id))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      success: true,
      message: "Crops fetched successfully",
      data: snakeRows(rows),
      pagination: getPaginationMeta({ page, limit, totalItems }),
    });
  } catch (error) {
    console.error("Get Crops Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};
