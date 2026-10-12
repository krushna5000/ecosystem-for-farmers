// Pure DB I/O for vendor_schema.products. No business rules, no HTTP types.
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import {
  vendorProducts,
  vendorBrands,
  vendorCategories,
  vendorSubCategories,
} from "./vendorProduct.schema.js";
import { ciEq, now, bulkDeleteByVendor } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

const ownProduct = (id, vendorId) => and(eq(vendorProducts.id, id), eq(vendorProducts.vendorId, vendorId));

// products p JOIN brands b JOIN categories c JOIN sub_categories s
//   -> { product, brand_name, category_name, sub_category_name }
const selectProductsWithNames = (tx) =>
  exec(tx)
    .select({
      product: vendorProducts,
      brand_name: vendorBrands.brandName,
      category_name: vendorCategories.categoryName,
      sub_category_name: vendorSubCategories.subCategoryName,
    })
    .from(vendorProducts)
    .innerJoin(vendorBrands, eq(vendorProducts.brandId, vendorBrands.id))
    .innerJoin(vendorCategories, eq(vendorProducts.categoryId, vendorCategories.id))
    .innerJoin(vendorSubCategories, eq(vendorProducts.subCategoryId, vendorSubCategories.id));

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

export async function subCategoryBelongsToVendorInDB(subCategoryId, vendorId, tx) {
  const [subCategory] = await exec(tx)
    .select({ id: vendorSubCategories.id })
    .from(vendorSubCategories)
    .where(and(eq(vendorSubCategories.id, subCategoryId), eq(vendorSubCategories.vendorId, vendorId)));
  return Boolean(subCategory);
}

/** Case-insensitive product-name lookup within one vendor. */
export async function productNameExistsInDB(vendorId, productName, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorProducts.id })
    .from(vendorProducts)
    .where(and(ciEq(vendorProducts.productName, productName), eq(vendorProducts.vendorId, vendorId)));
  return Boolean(row);
}

export async function createVendorProductInDB(values, tx) {
  const [product] = await exec(tx).insert(vendorProducts).values(values).returning();
  return product;
}

/** One page of the vendor's products (with brand / category / sub-category names) plus the total count. */
export async function listVendorProductsInDB(vendorId, { limit, offset }, tx) {
  const [{ total }] = await exec(tx)
    .select({ total: count() })
    .from(vendorProducts)
    .where(eq(vendorProducts.vendorId, vendorId));

  const rows = await selectProductsWithNames(tx)
    .where(eq(vendorProducts.vendorId, vendorId))
    .orderBy(desc(vendorProducts.id))
    .limit(limit)
    .offset(offset);

  return { total: Number(total), rows };
}

const listVendorProductsByColumn = (column) => (vendorId, value, tx) =>
  selectProductsWithNames(tx)
    .where(and(eq(vendorProducts.vendorId, vendorId), eq(column, value)))
    .orderBy(desc(vendorProducts.id));

export const listVendorProductsByBrandInDB = listVendorProductsByColumn(vendorProducts.brandId);
export const listVendorProductsByCategoryInDB = listVendorProductsByColumn(vendorProducts.categoryId);
export const listVendorProductsBySubCategoryInDB = listVendorProductsByColumn(vendorProducts.subCategoryId);

export async function getVendorProductByIdInDB(id, vendorId, tx) {
  const [row] = await selectProductsWithNames(tx).where(ownProduct(id, vendorId));
  return row ?? null;
}

export async function vendorProductExistsInDB(id, vendorId, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorProducts.id })
    .from(vendorProducts)
    .where(ownProduct(id, vendorId));
  return Boolean(row);
}

export async function updateVendorProductInDB(id, vendorId, changes, tx) {
  const [updated] = await exec(tx)
    .update(vendorProducts)
    .set({ ...changes, updatedAt: now() })
    .where(ownProduct(id, vendorId))
    .returning();
  return updated ?? null;
}

/** Flips `status`; returns `{ id, status, updated_at }`, or null when the vendor has no such product. */
export async function toggleVendorProductStatusInDB(id, vendorId, tx) {
  const [updated] = await exec(tx)
    .update(vendorProducts)
    .set({ status: sql`NOT ${vendorProducts.status}`, updatedAt: now() })
    .where(ownProduct(id, vendorId))
    .returning({
      id: vendorProducts.id,
      status: vendorProducts.status,
      updated_at: vendorProducts.updatedAt,
    });
  return updated ?? null;
}

export async function deleteVendorProductInDB(id, vendorId, tx) {
  const [deleted] = await exec(tx).delete(vendorProducts).where(ownProduct(id, vendorId)).returning();
  return deleted ?? null;
}

export function bulkDeleteVendorProductsInDB(vendorId, ids) {
  return bulkDeleteByVendor(vendorProducts, vendorId, ids);
}
