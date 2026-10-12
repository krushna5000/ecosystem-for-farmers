// Pure DB I/O for company_schema.brands. No business rules, no req/res.
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companyBrands } from "./companyBrand.schema.js";
import {
  countOwned,
  findOwned,
  nowSql,
  pickCols,
  removeManyOwned,
  removeOwned,
} from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

const OPTION_COLUMNS = ["id", "brandName", "logo", "status"];
const DETAIL_COLUMNS = ["id", "brandName", "logo", "status", "createdAt", "updatedAt"];

const ownBrand = (id, companyId) =>
  and(eq(companyBrands.id, id), eq(companyBrands.companyId, companyId));

/** Case-insensitive brand-name lookup within one company. */
export async function brandNameExistsInDB(companyId, brandName, tx) {
  const [row] = await exec(tx)
    .select({ id: companyBrands.id })
    .from(companyBrands)
    .where(
      and(
        sql`LOWER(${companyBrands.brandName}) = LOWER(${brandName})`,
        eq(companyBrands.companyId, companyId),
      ),
    );
  return Boolean(row);
}

export async function createCompanyBrandInDB(values, tx) {
  const [brand] = await exec(tx).insert(companyBrands).values(values).returning();
  return brand;
}

/** Every brand of the company, by name (dropdowns). */
export function listCompanyBrandOptionsInDB(companyId, tx) {
  return exec(tx)
    .select(pickCols(companyBrands, OPTION_COLUMNS))
    .from(companyBrands)
    .where(eq(companyBrands.companyId, companyId))
    .orderBy(asc(companyBrands.brandName));
}

export function countCompanyBrandsInDB(companyId, tx) {
  return countOwned(companyBrands, companyId, tx);
}

export function listCompanyBrandsInDB(companyId, { limit, offset }, tx) {
  return exec(tx)
    .select(pickCols(companyBrands, DETAIL_COLUMNS))
    .from(companyBrands)
    .where(eq(companyBrands.companyId, companyId))
    .orderBy(desc(companyBrands.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCompanyBrandByIdInDB(id, companyId, tx) {
  const [brand] = await exec(tx)
    .select(pickCols(companyBrands, DETAIL_COLUMNS))
    .from(companyBrands)
    .where(ownBrand(id, companyId));
  return brand ?? null;
}

export async function findOwnedCompanyBrandInDB(id, companyId, tx) {
  return (await findOwned(companyBrands, id, companyId, tx)) ?? null;
}

/** `changes` holds only the fields to write; updated_at is always refreshed. */
export async function updateCompanyBrandInDB(id, companyId, changes, tx) {
  const [updated] = await exec(tx)
    .update(companyBrands)
    .set({ ...changes, updatedAt: nowSql })
    .where(ownBrand(id, companyId))
    .returning();
  return updated ?? null;
}

export async function deleteCompanyBrandInDB(id, companyId, tx) {
  return (await removeOwned(companyBrands, id, companyId, tx)) ?? null;
}

export function deleteCompanyBrandsInDB(companyId, ids, tx) {
  return removeManyOwned(companyBrands, ids, companyId, tx);
}
