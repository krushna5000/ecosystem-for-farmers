// Pure DB I/O for vendor_schema.vendors. No business rules, no req/res.
import { desc, count, eq, inArray, or } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendors } from "./adminVendor.schema.js";

const exec = (tx) => tx ?? db;

/** A vendor that already uses this email or phone, or null. */
export async function findVendorIdByEmailOrPhoneInDB(email, phone, tx) {
  const [exists] = await exec(tx)
    .select({ id: vendors.id })
    .from(vendors)
    .where(or(eq(vendors.email, email), eq(vendors.phone, phone)));
  return exists ?? null;
}

export async function createVendorInDB(values, tx) {
  const [vendor] = await exec(tx).insert(vendors).values(values).returning();
  return vendor;
}

export function listVendorsInDB(tx) {
  return exec(tx).select().from(vendors).orderBy(desc(vendors.id));
}

/** One page of vendors plus the total row count. */
export async function listVendorsPageInDB({ limit, offset }, tx) {
  const [{ total }] = await exec(tx).select({ total: count() }).from(vendors);

  const rows = await exec(tx).select().from(vendors).orderBy(desc(vendors.id)).limit(limit).offset(offset);

  return { total, rows };
}

export async function getVendorByIdInDB(id, tx) {
  const [vendor] = await exec(tx).select().from(vendors).where(eq(vendors.id, id));
  return vendor ?? null;
}

export async function updateVendorInDB(id, patch, tx) {
  const [row] = await exec(tx).update(vendors).set(patch).where(eq(vendors.id, id)).returning();
  return row ?? null;
}

export async function deleteVendorInDB(id, tx) {
  const [deleted] = await exec(tx)
    .delete(vendors)
    .where(eq(vendors.id, id))
    .returning({ id: vendors.id, name: vendors.name, email: vendors.email });
  return deleted ?? null;
}

export async function getVendorActiveStateInDB(id, tx) {
  const [vendor] = await exec(tx)
    .select({ isActive: vendors.isActive })
    .from(vendors)
    .where(eq(vendors.id, id));
  return vendor ?? null;
}

export async function setVendorActiveInDB(id, isActive, tx) {
  const [updated] = await exec(tx)
    .update(vendors)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(vendors.id, id))
    .returning({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      is_active: vendors.isActive,
    });
  return updated ?? null;
}

/** Activates + approves the vendor that owns `token` and swaps in the reset token. Returns the matching rows. */
export function approveVendorByVerifyTokenInDB(token, resetToken, tx) {
  return exec(tx)
    .update(vendors)
    .set({ isActive: true, isApprove: true, verifyToken: resetToken })
    .where(eq(vendors.verifyToken, token))
    .returning({ email: vendors.email, name: vendors.name });
}

export async function findVendorVerifyTokenInDB(token, tx) {
  const [row] = await exec(tx)
    .select({ verifyToken: vendors.verifyToken })
    .from(vendors)
    .where(eq(vendors.verifyToken, token));
  return row ?? null;
}

/** The most recently created approved vendor (legacy "already verified" fallback). */
export async function findLatestApprovedVendorInDB(tx) {
  const [row] = await exec(tx)
    .select({ verifyToken: vendors.verifyToken })
    .from(vendors)
    .where(eq(vendors.isApprove, true))
    .orderBy(desc(vendors.id))
    .limit(1);
  return row ?? null;
}

/** Sets the new password and consumes the token. Returns the matching rows (empty = unknown token). */
export function resetVendorPasswordByTokenInDB(token, hashedPassword, tx) {
  return exec(tx)
    .update(vendors)
    .set({ password: hashedPassword, verifyToken: null })
    .where(eq(vendors.verifyToken, token))
    .returning({ id: vendors.id, email: vendors.email });
}

export function listVendorsByIdsInDB(ids, tx) {
  return exec(tx).select().from(vendors).where(inArray(vendors.id, ids));
}

export function deleteVendorsByIdsInDB(ids, tx) {
  return exec(tx)
    .delete(vendors)
    .where(inArray(vendors.id, ids))
    .returning({ id: vendors.id, name: vendors.name, email: vendors.email });
}
