// Pure DB I/O for company_schema.company_types. No business rules, no req/res.
import { asc, count, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companyTypes } from "./adminCompanyType.schema.js";

const exec = (tx) => tx ?? db;

export async function createCompanyTypeInDB(values, tx) {
  const [row] = await exec(tx).insert(companyTypes).values(values).returning();
  return row;
}

export function listCompanyTypesInDB(tx) {
  return exec(tx).select().from(companyTypes).orderBy(asc(companyTypes.id));
}

/** One page of company types plus the total row count. */
export async function listCompanyTypesPageInDB({ limit, offset }, tx) {
  const [{ total }] = await exec(tx).select({ total: count() }).from(companyTypes);

  const rows = await exec(tx)
    .select()
    .from(companyTypes)
    .orderBy(asc(companyTypes.id))
    .limit(limit)
    .offset(offset);

  return { total, rows };
}

export async function updateCompanyTypeInDB(id, changes, tx) {
  const [row] = await exec(tx).update(companyTypes).set(changes).where(eq(companyTypes.id, id)).returning();
  return row ?? null;
}

export async function deleteCompanyTypeInDB(id, tx) {
  const [row] = await exec(tx).delete(companyTypes).where(eq(companyTypes.id, id)).returning();
  return row ?? null;
}
