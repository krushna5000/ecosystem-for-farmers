// Pure DB I/O for company OTPs. No business rules, no req/res.
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companies, companyOtp } from "./adminCompanyOtp.schema.js";

const exec = (tx) => tx ?? db;

export async function findCompanyIdInDB(companyId, tx) {
  const [company] = await exec(tx)
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, companyId));
  return company ?? null;
}

export async function createCompanyOtpInDB(values, tx) {
  const [row] = await exec(tx).insert(companyOtp).values(values).returning();
  return row;
}

/** Most recent OTP issued to a company. */
export async function findLatestCompanyOtpInDB(companyId, tx) {
  const [otpRecord] = await exec(tx)
    .select()
    .from(companyOtp)
    .where(eq(companyOtp.companyId, companyId))
    .orderBy(desc(companyOtp.createdAt), desc(companyOtp.id))
    .limit(1);
  return otpRecord ?? null;
}

/** Marks the company approved; returns the (snake_case aliased) public columns. */
export async function approveCompanyInDB(companyId, tx) {
  const [updated] = await exec(tx)
    .update(companies)
    .set({ isApproved: true, updatedAt: new Date() })
    .where(eq(companies.id, companyId))
    .returning({
      id: companies.id,
      name: companies.name,
      email: companies.email,
      phone: companies.phone,
      gst_no: companies.gstNo,
      is_approved: companies.isApproved,
    });
  return updated ?? null;
}
