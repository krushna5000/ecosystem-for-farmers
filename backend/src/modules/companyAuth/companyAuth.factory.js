// Pure DB I/O for company_schema.companies (login, password, profile). No business rules, no req/res.
import { eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companies } from "./companyAuth.schema.js";
import { nowSql } from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

export async function findCompanyByEmailInDB(email, tx) {
  const [company] = await exec(tx).select().from(companies).where(eq(companies.email, email));
  return company ?? null;
}

export async function findCompanyPasswordByIdInDB(id, tx) {
  const [company] = await exec(tx)
    .select({ password: companies.password })
    .from(companies)
    .where(eq(companies.id, id));
  return company ?? null;
}

export async function updateCompanyPasswordInDB(id, hashedPassword, tx) {
  await exec(tx)
    .update(companies)
    .set({ password: hashedPassword, updatedAt: nowSql })
    .where(eq(companies.id, id));
}

export async function getCompanyProfileByIdInDB(id, tx) {
  const [company] = await exec(tx)
    .select({
      id: companies.id,
      email: companies.email,
      name: companies.name,
      logoUrl: companies.logoUrl,
      phone: companies.phone,
      gstNo: companies.gstNo,
      llpNo: companies.llpNo,
      cinNo: companies.cinNo,
    })
    .from(companies)
    .where(eq(companies.id, id));
  return company ?? null;
}
