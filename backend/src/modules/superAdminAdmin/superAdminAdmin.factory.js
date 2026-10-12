// Pure DB I/O for the super admin / admin accounts. No business rules, no HTTP types.
import { eq, sql, asc, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { superAdmins, admins, vendors, companies } from "./superAdminAdmin.schema.js";

const exec = (tx) => tx ?? db;

const lowerEq = (col, value) => sql`lower(${col}) = lower(${value})`;

/** True when the email is used by a super admin, admin, vendor or company (case-insensitive). */
export async function emailExistsInDB(email, tx) {
  const value = email.trim();
  const checks = await Promise.all([
    exec(tx).select({ id: superAdmins.id }).from(superAdmins).where(lowerEq(superAdmins.email, value)).limit(1),
    exec(tx).select({ id: admins.id }).from(admins).where(lowerEq(admins.email, value)).limit(1),
    exec(tx).select({ id: vendors.id }).from(vendors).where(lowerEq(vendors.email, value)).limit(1),
    exec(tx).select({ id: companies.id }).from(companies).where(lowerEq(companies.email, value)).limit(1),
  ]);
  return checks.some((rows) => rows.length > 0);
}

/** Raw super_admins row (camelCase, includes the password hash) — used by login only. */
export async function findSuperAdminByEmailInDB(email, tx) {
  const [row] = await exec(tx).select().from(superAdmins).where(eq(superAdmins.email, email));
  return row ?? null;
}

export async function createAdminInDB({ name, email, password }, tx) {
  const [row] = await exec(tx)
    .insert(admins)
    .values({ name, email, password })
    .returning({ id: admins.id, name: admins.name, email: admins.email, created_at: admins.createdAt });
  return row;
}

export function listAdminsInDB(tx) {
  return exec(tx)
    .select({ id: admins.id, name: admins.name, email: admins.email })
    .from(admins)
    .orderBy(asc(admins.id));
}

export async function getAdminByIdInDB(id, tx) {
  const [row] = await exec(tx).select().from(admins).where(eq(admins.id, id));
  return row ?? null;
}

export async function updateAdminInDB(id, changes, tx) {
  await exec(tx).update(admins).set(changes).where(eq(admins.id, id));
}

export async function deleteAdminInDB(id, tx) {
  await exec(tx).delete(admins).where(eq(admins.id, id));
}

export function findExistingAdminIdsInDB(ids, tx) {
  return exec(tx).select({ id: admins.id }).from(admins).where(inArray(admins.id, ids));
}

/** Returns the ids that were deleted. */
export async function bulkDeleteAdminsInDB(ids, tx) {
  const rows = await exec(tx).delete(admins).where(inArray(admins.id, ids)).returning({ id: admins.id });
  return rows.map((row) => row.id);
}
