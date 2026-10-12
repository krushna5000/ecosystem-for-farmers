// Pure DB I/O for vendor_schema.sub_categories. No business rules, no HTTP types.
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendorSubCategories, vendorBrands, vendorCategories } from "./vendorSubCategory.schema.js";
import { ciEq, now, pageByVendor, bulkDeleteByVendor } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

const ownSubCategory = (id, vendorId) =>
  and(eq(vendorSubCategories.id, id), eq(vendorSubCategories.vendorId, vendorId));

export async function brandBelongsToVendorInDB(brandId, vendorId, tx) {
  const [brand] = await exec(tx)
    .select({ id: vendorBrands.id })
    .from(vendorBrands)
    .where(and(eq(vendorBrands.id, brandId), eq(vendorBrands.vendorId, vendorId)));
  return Boolean(brand);
}

export async function categoryBelongsToVendorInDB(categoryId, vendorId, tx) {
  const [category] = await exec(tx)
    .select({ id: vendorCategories.id })
    .from(vendorCategories)
    .where(and(eq(vendorCategories.id, categoryId), eq(vendorCategories.vendorId, vendorId)));
  return Boolean(category);
}

/** Case-insensitive name lookup within one brand + category of one vendor. */
export async function subCategoryNameExistsInDB(vendorId, brandId, categoryId, subCategoryName, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorSubCategories.id })
    .from(vendorSubCategories)
    .where(
      and(
        ciEq(vendorSubCategories.subCategoryName, subCategoryName),
        eq(vendorSubCategories.brandId, brandId),
        eq(vendorSubCategories.categoryId, categoryId),
        eq(vendorSubCategories.vendorId, vendorId),
      ),
    );
  return Boolean(row);
}

export async function createVendorSubCategoryInDB(values, tx) {
  const [subCategory] = await exec(tx).insert(vendorSubCategories).values(values).returning();
  return subCategory;
}

export function listVendorSubCategoriesInDB(vendorId, { limit, offset }) {
  return pageByVendor(vendorSubCategories, vendorId, desc(vendorSubCategories.id), { limit, offset });
}

export async function vendorSubCategoryExistsInDB(id, vendorId, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorSubCategories.id })
    .from(vendorSubCategories)
    .where(ownSubCategory(id, vendorId));
  return Boolean(row);
}

export async function updateVendorSubCategoryInDB(id, vendorId, changes, tx) {
  const [updated] = await exec(tx)
    .update(vendorSubCategories)
    .set({ ...changes, updatedAt: now() })
    .where(ownSubCategory(id, vendorId))
    .returning();
  return updated ?? null;
}

/**
 * Flips `status`. Like the old code this is NOT scoped to a vendor (docs/routes/vendor.md) — it matches on
 * the id alone. Returns `{ id, status, updated_at }`, or null when no such sub-category exists.
 */
export async function toggleVendorSubCategoryStatusInDB(id, tx) {
  const [updated] = await exec(tx)
    .update(vendorSubCategories)
    .set({ status: sql`NOT ${vendorSubCategories.status}`, updatedAt: now() })
    .where(eq(vendorSubCategories.id, id))
    .returning({
      id: vendorSubCategories.id,
      status: vendorSubCategories.status,
      updated_at: vendorSubCategories.updatedAt,
    });
  return updated ?? null;
}

export async function deleteVendorSubCategoryInDB(id, vendorId, tx) {
  const [deleted] = await exec(tx).delete(vendorSubCategories).where(ownSubCategory(id, vendorId)).returning();
  return deleted ?? null;
}

export function bulkDeleteVendorSubCategoriesInDB(vendorId, ids) {
  return bulkDeleteByVendor(vendorSubCategories, vendorId, ids);
}
