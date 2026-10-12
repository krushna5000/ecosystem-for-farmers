// Pure DB I/O for company_schema.categories. No business rules, no req/res.
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companyBrands, companyCategories } from "./companyCategory.schema.js";
import {
  countOwned,
  findOwned,
  nowSql,
  pickCols,
  removeManyOwned,
  removeOwned,
} from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

const OPTION_COLUMNS = ["id", "brandId", "categoryName", "status"];
const TABLE_COLUMNS = ["id", "brandId", "categoryName", "createdAt", "updatedAt", "status"];

const ownCategory = (id, companyId) =>
  and(eq(companyCategories.id, id), eq(companyCategories.companyId, companyId));

/** A brand of this company, or null. */
export async function findOwnedBrandInDB(brandId, companyId, tx) {
  return (await findOwned(companyBrands, brandId, companyId, tx)) ?? null;
}

/** Case-insensitive category-name lookup under one brand of the company. */
export async function categoryNameExistsInDB(companyId, brandId, categoryName, tx) {
  const [row] = await exec(tx)
    .select({ id: companyCategories.id })
    .from(companyCategories)
    .where(
      and(
        sql`LOWER(${companyCategories.categoryName}) = LOWER(${categoryName})`,
        eq(companyCategories.brandId, brandId),
        eq(companyCategories.companyId, companyId),
      ),
    );
  return Boolean(row);
}

/** Exact (case-sensitive) name lookup under one brand, ignoring the category being renamed. */
export async function otherCategoryNamedInDB(companyId, brandId, categoryName, excludeId, tx) {
  const [row] = await exec(tx)
    .select({ id: companyCategories.id })
    .from(companyCategories)
    .where(
      and(
        eq(companyCategories.categoryName, categoryName),
        eq(companyCategories.brandId, brandId),
        eq(companyCategories.companyId, companyId),
        ne(companyCategories.id, excludeId),
      ),
    );
  return Boolean(row);
}

export async function createCompanyCategoryInDB(values, tx) {
  const [category] = await exec(tx).insert(companyCategories).values(values).returning();
  return category;
}

/** Every category of the company, by name (dropdowns). */
export function listCompanyCategoryOptionsInDB(companyId, tx) {
  return exec(tx)
    .select(pickCols(companyCategories, OPTION_COLUMNS))
    .from(companyCategories)
    .where(eq(companyCategories.companyId, companyId))
    .orderBy(asc(companyCategories.categoryName));
}

export function countCompanyCategoriesInDB(companyId, tx) {
  return countOwned(companyCategories, companyId, tx);
}

export function listCompanyCategoriesInDB(companyId, { limit, offset }, tx) {
  return exec(tx)
    .select(pickCols(companyCategories, TABLE_COLUMNS))
    .from(companyCategories)
    .where(eq(companyCategories.companyId, companyId))
    .orderBy(desc(companyCategories.id))
    .limit(limit)
    .offset(offset);
}

export async function getCompanyCategoryByIdInDB(id, companyId, tx) {
  return (await findOwned(companyCategories, id, companyId, tx)) ?? null;
}

export async function updateCompanyCategoryInDB(id, companyId, changes, tx) {
  const [updated] = await exec(tx)
    .update(companyCategories)
    .set({ ...changes, updatedAt: nowSql })
    .where(ownCategory(id, companyId))
    .returning();
  return updated ?? null;
}

export async function toggleCompanyCategoryStatusInDB(id, companyId, tx) {
  await exec(tx)
    .update(companyCategories)
    .set({ status: sql`NOT ${companyCategories.status}`, updatedAt: nowSql })
    .where(ownCategory(id, companyId));
}

export async function deleteCompanyCategoryInDB(id, companyId, tx) {
  return (await removeOwned(companyCategories, id, companyId, tx)) ?? null;
}

export function deleteCompanyCategoriesInDB(companyId, ids, tx) {
  return removeManyOwned(companyCategories, ids, companyId, tx);
}
