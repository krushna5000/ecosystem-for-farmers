// Pure DB I/O for company_schema.companies (+ the joined company type name). No business rules, no req/res.
import { desc, count, eq, inArray, getTableColumns } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companies, companyTypes } from "./adminCompany.schema.js";

const exec = (tx) => tx ?? db;

// companies.* plus the joined company type name
const selectCompanies = (tx) =>
  exec(tx)
    .select({ ...getTableColumns(companies), company_type_name: companyTypes.type })
    .from(companies)
    .leftJoin(companyTypes, eq(companies.companyType, companyTypes.id));

const findCompanyIdBy = async (column, value, tx) => {
  const [row] = await exec(tx).select({ id: companies.id }).from(companies).where(eq(column, value));
  return row ?? null;
};

export const findCompanyIdByEmailInDB = (email, tx) => findCompanyIdBy(companies.email, email, tx);
export const findCompanyIdByGstNoInDB = (gstNo, tx) => findCompanyIdBy(companies.gstNo, gstNo, tx);
export const findCompanyIdByPhoneInDB = (phone, tx) => findCompanyIdBy(companies.phone, phone, tx);

/** Returns the new row's public columns (snake_case aliases, as the API has always sent them). */
export async function createCompanyInDB(values, tx) {
  const [inserted] = await exec(tx)
    .insert(companies)
    .values(values)
    .returning({
      id: companies.id,
      company_type: companies.companyType,
      email: companies.email,
      name: companies.name,
      address: companies.address,
      gst_no: companies.gstNo,
      phone: companies.phone,
      verify_token: companies.verifyToken,
      logo_url: companies.logoUrl,
      created_at: companies.createdAt,
    });
  return inserted;
}

export function listCompaniesInDB(tx) {
  return selectCompanies(tx).orderBy(desc(companies.id));
}

/** One page of companies plus the total row count. */
export async function listCompaniesPageInDB({ limit, offset }, tx) {
  const [{ total }] = await exec(tx).select({ total: count() }).from(companies);

  const rows = await selectCompanies(tx).orderBy(desc(companies.id)).limit(limit).offset(offset);

  return { total, rows };
}

export async function getCompanyByIdInDB(id, tx) {
  const [row] = await selectCompanies(tx).where(eq(companies.id, id));
  return row ?? null;
}

export async function updateCompanyInDB(id, patch, tx) {
  const [row] = await exec(tx).update(companies).set(patch).where(eq(companies.id, id)).returning();
  return row ?? null;
}

export async function deleteCompanyInDB(id, tx) {
  const [deleted] = await exec(tx)
    .delete(companies)
    .where(eq(companies.id, id))
    .returning({ id: companies.id, name: companies.name, email: companies.email });
  return deleted ?? null;
}

export async function getCompanyActiveStateInDB(id, tx) {
  const [company] = await exec(tx)
    .select({ isActive: companies.isActive })
    .from(companies)
    .where(eq(companies.id, id));
  return company ?? null;
}

export async function setCompanyActiveInDB(id, isActive, tx) {
  const [updated] = await exec(tx)
    .update(companies)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning({
      id: companies.id,
      name: companies.name,
      email: companies.email,
      is_active: companies.isActive,
    });
  return updated ?? null;
}

/** Sets the new password and consumes the token. Returns the matching rows (empty = unknown token). */
export function resetCompanyPasswordByTokenInDB(token, hashedPassword, tx) {
  return exec(tx)
    .update(companies)
    .set({ password: hashedPassword, verifyToken: null })
    .where(eq(companies.verifyToken, token))
    .returning({ id: companies.id, email: companies.email });
}

/** Approves the company that owns `token` and swaps in the reset token. Returns the matching rows. */
export function approveCompanyByVerifyTokenInDB(token, resetToken, tx) {
  return exec(tx)
    .update(companies)
    .set({ isApproved: true, verifyToken: resetToken })
    .where(eq(companies.verifyToken, token))
    .returning({ email: companies.email, name: companies.name });
}

export async function findCompanyVerifyTokenInDB(token, tx) {
  const [row] = await exec(tx)
    .select({ verifyToken: companies.verifyToken })
    .from(companies)
    .where(eq(companies.verifyToken, token));
  return row ?? null;
}

/** The most recently created approved company (legacy "already verified" fallback). */
export async function findLatestApprovedCompanyInDB(tx) {
  const [row] = await exec(tx)
    .select({ verifyToken: companies.verifyToken })
    .from(companies)
    .where(eq(companies.isApproved, true))
    .orderBy(desc(companies.id))
    .limit(1);
  return row ?? null;
}

export function deleteCompaniesByIdsInDB(ids, tx) {
  return exec(tx)
    .delete(companies)
    .where(inArray(companies.id, ids))
    .returning({ id: companies.id, name: companies.name, email: companies.email });
}
