import { eq, asc, count } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { companyTypes } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { dbErrorMessage, parsePagination } from "../../../utils/admin/helpers.js";

export const createCompanyType = async (req, res) => {
  try {
    const { type, description } = req.body;

    const [row] = await db
      .insert(companyTypes)
      .values({ type, description })
      .returning();

    res.status(201).json({ success: true, data: snakeKeys(row) });
  } catch (error) {
    console.error("Error creating company type:", error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// GET COMPANY TYPES (with pagination support)
export const getCompanyTypes = async (req, res) => {
  try {
    const { page, limit, offset, hasPagination } = parsePagination(req.query);

    if (hasPagination) {
      const [{ total }] = await db.select({ total: count() }).from(companyTypes);

      const rows = await db
        .select()
        .from(companyTypes)
        .orderBy(asc(companyTypes.id))
        .limit(limit)
        .offset(offset);

      return res.json({
        success: true,
        data: snakeRows(rows),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const rows = await db.select().from(companyTypes).orderBy(asc(companyTypes.id));

    res.json({ success: true, data: snakeRows(rows) });
  } catch (error) {
    console.error("Error fetching company types:", error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

export const updateCompanyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;

    const [row] = await db
      .update(companyTypes)
      .set({ type: type ?? null, description: description ?? null })
      .where(eq(companyTypes.id, id))
      .returning();

    if (!row) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: snakeKeys(row) });
  } catch (error) {
    console.error("Error updating company type:", error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

export const deleteCompanyType = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db.delete(companyTypes).where(eq(companyTypes.id, id)).returning();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Company type deleted successfully" });
  } catch (error) {
    console.error("Error deleting company type:", error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};
