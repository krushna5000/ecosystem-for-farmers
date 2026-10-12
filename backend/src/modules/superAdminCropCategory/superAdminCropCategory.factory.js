// Pure DB I/O for farms_schema.crop_categories. No business rules, no HTTP types.
import { eq, asc, count, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { cropCategories } from "./superAdminCropCategory.schema.js";

const exec = (tx) => tx ?? db;

export async function createCategoryInDB(values, tx) {
  const [row] = await exec(tx).insert(cropCategories).values(values).returning();
  return row;
}

export async function listCategoriesInDB({ limit, offset }, tx) {
  const rows = await exec(tx)
    .select()
    .from(cropCategories)
    .orderBy(asc(cropCategories.createdAt))
    .limit(limit)
    .offset(offset);
  const [{ total }] = await exec(tx).select({ total: count() }).from(cropCategories);

  return { rows, total };
}

export async function getCategoryByIdInDB(id, tx) {
  const [row] = await exec(tx).select().from(cropCategories).where(eq(cropCategories.id, id));
  return row ?? null;
}

export async function updateCategoryInDB(id, changes, tx) {
  const [row] = await exec(tx).update(cropCategories).set(changes).where(eq(cropCategories.id, id)).returning();
  return row ?? null;
}

export async function deleteCategoryInDB(id, tx) {
  const [row] = await exec(tx).delete(cropCategories).where(eq(cropCategories.id, id)).returning();
  return row ?? null;
}

/** Returns the ids that were deleted. */
export async function bulkDeleteCategoriesInDB(ids, tx) {
  const rows = await exec(tx)
    .delete(cropCategories)
    .where(inArray(cropCategories.id, ids))
    .returning({ id: cropCategories.id });
  return rows.map((row) => row.id);
}
