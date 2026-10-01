import { eq, asc, count, inArray } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { cropCategories } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";

export const createCategory = async (categoryName, description) => {
  const [row] = await db
    .insert(cropCategories)
    .values({ categoryName, description: description ?? null })
    .returning();
  return snakeKeys(row);
};

export const getAllCategories = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rows = await db
    .select()
    .from(cropCategories)
    .orderBy(asc(cropCategories.createdAt))
    .limit(limit)
    .offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(cropCategories);

  return { data: snakeRows(rows), total };
};

export const getCategoryById = async (id) => {
  const [row] = await db.select().from(cropCategories).where(eq(cropCategories.id, id));
  return snakeKeys(row) || null;
};

export const updateCategory = async (id, categoryName, description) => {
  const [row] = await db
    .update(cropCategories)
    .set({ categoryName, description: description ?? null })
    .where(eq(cropCategories.id, id))
    .returning();
  return snakeKeys(row) || null;
};

export const deleteCategory = async (id) => {
  const [row] = await db.delete(cropCategories).where(eq(cropCategories.id, id)).returning();
  return snakeKeys(row) || null;
};

export const bulkDeleteCategories = async (ids) => {
  const rows = await db
    .delete(cropCategories)
    .where(inArray(cropCategories.id, ids))
    .returning({ id: cropCategories.id });
  return {
    deletedCount: rows.length,
    deletedIds: rows.map((row) => row.id),
  };
};
