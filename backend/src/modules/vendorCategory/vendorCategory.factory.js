// Pure DB I/O for vendor_schema.categories. No business rules, no HTTP types.
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendorCategories, vendorBrands } from "./vendorCategory.schema.js";
import { ciEq, now, pageByVendor, bulkDeleteByVendor } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

const ownCategory = (id, vendorId) =>
  and(eq(vendorCategories.id, id), eq(vendorCategories.vendorId, vendorId));

export async function brandBelongsToVendorInDB(brandId, vendorId, tx) {
  const [brand] = await exec(tx)
    .select({ id: vendorBrands.id })
    .from(vendorBrands)
    .where(and(eq(vendorBrands.id, brandId), eq(vendorBrands.vendorId, vendorId)));
  return Boolean(brand);
}

/** Case-insensitive name lookup within one brand of one vendor (used on create). */
export async function categoryNameExistsInDB(vendorId, brandId, categoryName, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorCategories.id })
    .from(vendorCategories)
    .where(
      and(
        ciEq(vendorCategories.categoryName, categoryName),
        eq(vendorCategories.brandId, brandId),
        eq(vendorCategories.vendorId, vendorId),
      ),
    );
  return Boolean(row);
}

/** Exact (case-sensitive) name lookup within one brand, ignoring one category (used on update). */
export async function otherCategoryWithNameInDB(vendorId, brandId, categoryName, excludeId, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorCategories.id })
    .from(vendorCategories)
    .where(
      and(
        eq(vendorCategories.categoryName, categoryName),
        eq(vendorCategories.brandId, brandId),
        eq(vendorCategories.vendorId, vendorId),
        ne(vendorCategories.id, excludeId),
      ),
    );
  return Boolean(row);
}

export async function createVendorCategoryInDB(values, tx) {
  const [category] = await exec(tx).insert(vendorCategories).values(values).returning();
  return category;
}

export function listVendorCategoriesInDB(vendorId, { limit, offset }) {
  return pageByVendor(vendorCategories, vendorId, desc(vendorCategories.id), { limit, offset });
}

export async function getVendorCategoryByIdInDB(id, vendorId, tx) {
  const [category] = await exec(tx).select().from(vendorCategories).where(ownCategory(id, vendorId));
  return category ?? null;
}

export async function updateVendorCategoryInDB(id, vendorId, changes, tx) {
  const [updated] = await exec(tx)
    .update(vendorCategories)
    .set({ ...changes, updatedAt: now() })
    .where(ownCategory(id, vendorId))
    .returning();
  return updated ?? null;
}

/** Flips `status` of one of the vendor's categories; returns the row id, or null when not found. */
export async function toggleVendorCategoryStatusInDB(id, vendorId, tx) {
  const [updated] = await exec(tx)
    .update(vendorCategories)
    .set({ status: sql`NOT ${vendorCategories.status}`, updatedAt: now() })
    .where(ownCategory(id, vendorId))
    .returning({ id: vendorCategories.id });
  return updated ?? null;
}

export async function deleteVendorCategoryInDB(id, vendorId, tx) {
  const [deleted] = await exec(tx).delete(vendorCategories).where(ownCategory(id, vendorId)).returning();
  return deleted ?? null;
}

export function bulkDeleteVendorCategoriesInDB(vendorId, ids) {
  return bulkDeleteByVendor(vendorCategories, vendorId, ids);
}
