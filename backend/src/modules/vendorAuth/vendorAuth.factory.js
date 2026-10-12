// Pure DB I/O for vendor_schema.vendors / vendor_otp. No business rules, no HTTP types.
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendors, vendorOtp } from "./vendorAuth.schema.js";
import { now } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

export async function getVendorByEmailInDB(email, tx) {
  const [vendor] = await exec(tx).select().from(vendors).where(eq(vendors.email, email));
  return vendor ?? null;
}

export async function getVendorByIdInDB(id, tx) {
  const [vendor] = await exec(tx).select().from(vendors).where(eq(vendors.id, id));
  return vendor ?? null;
}

export async function updateVendorPasswordInDB(id, hashedPassword, tx) {
  await exec(tx).update(vendors).set({ password: hashedPassword, updatedAt: now() }).where(eq(vendors.id, id));
}

/** Stores an OTP that expires 5 minutes from now (database clock). */
export async function createVendorOtpInDB({ vendorId, email, otp }, tx) {
  await exec(tx)
    .insert(vendorOtp)
    .values({ vendorId, email, otp, expiresAt: sql`NOW() + INTERVAL '5 minutes'` });
}

/** Latest unexpired OTP row matching email + code. */
export async function getValidVendorOtpInDB(email, otp, tx) {
  const [stored] = await exec(tx)
    .select()
    .from(vendorOtp)
    .where(and(eq(vendorOtp.email, email), eq(vendorOtp.otp, otp), gt(vendorOtp.expiresAt, now())))
    .orderBy(desc(vendorOtp.createdAt))
    .limit(1);
  return stored ?? null;
}

export async function deleteVendorOtpInDB(email, otp, tx) {
  await exec(tx).delete(vendorOtp).where(and(eq(vendorOtp.email, email), eq(vendorOtp.otp, otp)));
}
