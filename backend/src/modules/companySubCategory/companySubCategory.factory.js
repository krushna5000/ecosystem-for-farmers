// Pure DB I/O for company_schema.sub_categories. No business rules, no req/res.
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companyBrands, companyCategories, companySubCategories } from "./companySubCategory.schema.js";
import {
  countOwned,
  findOwned,
  nowSql,
  pickCols,
  removeManyOwned,
  removeOwned,
} from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

const OPTION_COLUMNS = ["id", "brandId", "categoryId", "subCategoryName", "status"];
const TABLE_COLUMNS = [
  "id",
  "brandId",
  "categoryId",
  "subCategoryName",
  "status",
  "createdAt",
  "updatedAt",
];

// Lookups, updates and deletes are all scoped to the logged-in company.
const ownSubCategory = (id, companyId) =>
  and(eq(companySubCategories.id, id), eq(companySubCategories.companyId, companyId));

/** A brand of this company, or null. */
export async function findOwnedBrandInDB(brandId, companyId, tx) {
  return (await findOwned(companyBrands, brandId, companyId, tx)) ?? null;
}

/** A category of this company, or null. */
export async function findOwnedCategoryInDB(categoryId, companyId, tx) {
  return (await findOwned(companyCategories, categoryId, companyId, tx)) ?? null;
}

/** Case-insensitive sub-category-name lookup under one brand + category of the company. */
export async function subCategoryNameExistsInDB(companyId, brandId, categoryId, name, tx) {
  const [row] = await exec(tx)
    .select({ id: companySubCategories.id })
    .from(companySubCategories)
    .where(
      and(
        sql`LOWER(${companySubCategories.subCategoryName}) = LOWER(${name})`,
        eq(companySubCategories.brandId, brandId),
        eq(companySubCategories.categoryId, categoryId),
        eq(companySubCategories.companyId, companyId),
      ),
    );
  return Boolean(row);
}

export async function createCompanySubCategoryInDB(values, tx) {
  const [subCategory] = await exec(tx).insert(companySubCategories).values(values).returning();
  return subCategory;
}

/** Every sub-category of the company, by name (dropdowns). */
export function listCompanySubCategoryOptionsInDB(companyId, tx) {
  return exec(tx)
    .select(pickCols(companySubCategories, OPTION_COLUMNS))
    .from(companySubCategories)
    .where(eq(companySubCategories.companyId, companyId))
    .orderBy(asc(companySubCategories.subCategoryName));
}

export function countCompanySubCategoriesInDB(companyId, tx) {
  return countOwned(companySubCategories, companyId, tx);
}

export function listCompanySubCategoriesInDB(companyId, { limit, offset }, tx) {
  return exec(tx)
    .select(pickCols(companySubCategories, TABLE_COLUMNS))
    .from(companySubCategories)
    .where(eq(companySubCategories.companyId, companyId))
    .orderBy(desc(companySubCategories.id))
    .limit(limit)
    .offset(offset);
}

export async function getCompanySubCategoryByIdInDB(id, companyId, tx) {
  return (await findOwned(companySubCategories, id, companyId, tx)) ?? null;
}

/** `changes` holds only the fields to write; updated_at is always refreshed. */
export async function updateCompanySubCategoryInDB(id, companyId, changes, tx) {
  const [updated] = await exec(tx)
    .update(companySubCategories)
    .set({ ...changes, updatedAt: nowSql })
    .where(ownSubCategory(id, companyId))
    .returning();
  return updated ?? null;
}

/** Flips `status`; resolves to `{ id, status, updatedAt }`. */
export async function toggleCompanySubCategoryStatusInDB(id, companyId, tx) {
  const [updated] = await exec(tx)
    .update(companySubCategories)
    .set({ status: sql`NOT ${companySubCategories.status}`, updatedAt: nowSql })
    .where(ownSubCategory(id, companyId))
    .returning(pickCols(companySubCategories, ["id", "status", "updatedAt"]));
  return updated ?? null;
}

export async function deleteCompanySubCategoryInDB(id, companyId, tx) {
  return (await removeOwned(companySubCategories, id, companyId, tx)) ?? null;
}

export function deleteCompanySubCategoriesInDB(companyId, ids, tx) {
  return removeManyOwned(companySubCategories, ids, companyId, tx);
}
