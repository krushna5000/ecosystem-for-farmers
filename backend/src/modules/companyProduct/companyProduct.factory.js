// Pure DB I/O for company_schema.products. No business rules, no req/res.
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import {
  companyBrands,
  companyCategories,
  companySubCategories,
  companyProducts,
} from "./companyProduct.schema.js";
import {
  countOwned,
  findOwned,
  nowSql,
  removeManyOwned,
  removeOwned,
} from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

const p = companyProducts;

// Lookups, updates and deletes are all scoped to the logged-in company.
const ownProduct = (id, companyId) => and(eq(p.id, id), eq(p.companyId, companyId));

/** A brand of this company, or null. */
export async function findOwnedBrandInDB(brandId, companyId, tx) {
  return (await findOwned(companyBrands, brandId, companyId, tx)) ?? null;
}

/** A category of this company, or null. */
export async function findOwnedCategoryInDB(categoryId, companyId, tx) {
  return (await findOwned(companyCategories, categoryId, companyId, tx)) ?? null;
}

/** A sub-category of this company, or null. */
export async function findOwnedSubCategoryInDB(subCategoryId, companyId, tx) {
  return (await findOwned(companySubCategories, subCategoryId, companyId, tx)) ?? null;
}

/** A product of this company (plain row, no joins), or null. */
export async function findOwnedCompanyProductInDB(id, companyId, tx) {
  return (await findOwned(p, id, companyId, tx)) ?? null;
}

/** Case-insensitive product-name lookup within one company. */
export async function productNameExistsInDB(companyId, productName, tx) {
  const [row] = await exec(tx)
    .select({ id: p.id })
    .from(p)
    .where(and(sql`LOWER(${p.productName}) = LOWER(${productName})`, eq(p.companyId, companyId)));
  return Boolean(row);
}

export async function createCompanyProductInDB(values, tx) {
  const [product] = await exec(tx).insert(p).values(values).returning();
  return product;
}

/** Every product of the company, by name (dropdowns). */
export function listCompanyProductOptionsInDB(companyId, tx) {
  return exec(tx)
    .select({
      id: p.id,
      productName: p.productName,
      brandId: p.brandId,
      categoryId: p.categoryId,
      subCategoryId: p.subCategoryId,
      categoryName: companyCategories.categoryName,
      subCategoryName: companySubCategories.subCategoryName,
      chemicalComposition: p.chemicalComposition,
      image: p.image,
      status: p.status,
    })
    .from(p)
    .leftJoin(companyCategories, eq(p.categoryId, companyCategories.id))
    .leftJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
    .where(eq(p.companyId, companyId))
    .orderBy(asc(p.productName));
}

export function countCompanyProductsInDB(companyId, tx) {
  return countOwned(p, companyId, tx);
}

export function listCompanyProductsInDB(companyId, { limit, offset }, tx) {
  return exec(tx)
    .select({
      id: p.id,
      companyId: p.companyId,
      brandId: p.brandId,
      categoryId: p.categoryId,
      subCategoryId: p.subCategoryId,
      productName: p.productName,
      brandName: companyBrands.brandName,
      categoryName: companyCategories.categoryName,
      subCategoryName: companySubCategories.subCategoryName,
      description: p.description,
      chemicalComposition: p.chemicalComposition,
      cropIds: p.cropIds,
      diseaseNames: p.diseaseNames,
      image: p.image,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })
    .from(p)
    .innerJoin(companyBrands, eq(p.brandId, companyBrands.id))
    .innerJoin(companyCategories, eq(p.categoryId, companyCategories.id))
    .innerJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
    .where(eq(p.companyId, companyId))
    .orderBy(desc(p.id))
    .limit(limit)
    .offset(offset);
}

export async function getCompanyProductByIdInDB(id, companyId, tx) {
  const [row] = await exec(tx)
    .select({
      ...getTableColumns(p),
      brandName: companyBrands.brandName,
      categoryName: companyCategories.categoryName,
      subCategoryName: companySubCategories.subCategoryName,
    })
    .from(p)
    .innerJoin(companyBrands, eq(p.brandId, companyBrands.id))
    .innerJoin(companyCategories, eq(p.categoryId, companyCategories.id))
    .innerJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
    .where(ownProduct(id, companyId));
  return row ?? null;
}

/** `changes` holds only the fields to write; updated_at is always refreshed. */
export async function updateCompanyProductInDB(id, companyId, changes, tx) {
  const [updated] = await exec(tx)
    .update(p)
    .set({ ...changes, updatedAt: nowSql })
    .where(ownProduct(id, companyId))
    .returning();
  return updated ?? null;
}

/** Flips `status`; resolves to `{ id, status, updatedAt }`. */
export async function toggleCompanyProductStatusInDB(id, companyId, tx) {
  const [updated] = await exec(tx)
    .update(p)
    .set({ status: sql`NOT ${p.status}`, updatedAt: nowSql })
    .where(ownProduct(id, companyId))
    .returning({ id: p.id, status: p.status, updatedAt: p.updatedAt });
  return updated ?? null;
}

export async function deleteCompanyProductInDB(id, companyId, tx) {
  return (await removeOwned(p, id, companyId, tx)) ?? null;
}

export function deleteCompanyProductsInDB(companyId, ids, tx) {
  return removeManyOwned(p, ids, companyId, tx);
}
