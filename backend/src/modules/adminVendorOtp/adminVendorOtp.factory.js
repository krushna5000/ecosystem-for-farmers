// Pure DB I/O for vendor OTPs. No business rules, no req/res.
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendors, vendorOtp } from "./adminVendorOtp.schema.js";

const exec = (tx) => tx ?? db;

export async function findVendorIdInDB(vendorId, tx) {
  const [vendor] = await exec(tx)
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.id, vendorId));
  return vendor ?? null;
}

export async function createVendorOtpInDB(values, tx) {
  const [row] = await exec(tx).insert(vendorOtp).values(values).returning();
  return row;
}

/** Most recent OTP issued to a vendor. */
export async function findLatestVendorOtpInDB(vendorId, tx) {
  const [otpRecord] = await exec(tx)
    .select()
    .from(vendorOtp)
    .where(eq(vendorOtp.vendorId, vendorId))
    .orderBy(desc(vendorOtp.createdAt), desc(vendorOtp.id))
    .limit(1);
  return otpRecord ?? null;
}

/** Marks the vendor approved; returns the (snake_case aliased) public columns. */
export async function approveVendorInDB(vendorId, tx) {
  const [updated] = await exec(tx)
    .update(vendors)
    .set({ isApprove: true, updatedAt: new Date() })
    .where(eq(vendors.id, vendorId))
    .returning({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      phone: vendors.phone,
      is_approve: vendors.isApprove,
    });
  return updated ?? null;
}
