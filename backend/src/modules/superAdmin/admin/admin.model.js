import { eq, sql, asc, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { superAdmins, admins, vendors, companies } from "../../../db/schema/index.js";

const lowerEq = (col, value) => sql`lower(${col}) = lower(${value})`;

// True when the email is used by a super admin, admin, vendor or company.
export const emailExists = async (email) => {
  try {
    const value = email.trim();
    const checks = await Promise.all([
      db.select({ id: superAdmins.id }).from(superAdmins).where(lowerEq(superAdmins.email, value)).limit(1),
      db.select({ id: admins.id }).from(admins).where(lowerEq(admins.email, value)).limit(1),
      db.select({ id: vendors.id }).from(vendors).where(lowerEq(vendors.email, value)).limit(1),
      db.select({ id: companies.id }).from(companies).where(lowerEq(companies.email, value)).limit(1),
    ]);
    return checks.some((rows) => rows.length > 0);
  } catch (error) {
    console.error("emailExists Error:", error);
    throw error;
  }
};

// Raw super_admins row (camelCase) - used by login only.
export const findSuperAdminByEmail = async (email) => {
  const [row] = await db.select().from(superAdmins).where(eq(superAdmins.email, email));
  return row;
};

export const createAdmin = async (name, email, hashedPassword) => {
  const [row] = await db
    .insert(admins)
    .values({ name, email, password: hashedPassword })
    .returning({ id: admins.id, name: admins.name, email: admins.email, created_at: admins.createdAt });
  return row;
};

export const listAdmins = () =>
  db.select({ id: admins.id, name: admins.name, email: admins.email }).from(admins).orderBy(asc(admins.id));

export const getAdminById = async (id) => {
  const [row] = await db.select().from(admins).where(eq(admins.id, id));
  return row;
};

export const updateAdmin = (id, name, email) =>
  db.update(admins).set({ name, email }).where(eq(admins.id, id));

export const updateAdminPassword = (id, hashedPassword) =>
  db.update(admins).set({ password: hashedPassword }).where(eq(admins.id, id));

export const deleteAdmin = (id) => db.delete(admins).where(eq(admins.id, id));

export const findExistingAdminIds = (ids) =>
  db.select({ id: admins.id }).from(admins).where(inArray(admins.id, ids));

// Returns the ids that were deleted.
export const bulkDeleteAdmins = async (ids) => {
  const rows = await db.delete(admins).where(inArray(admins.id, ids)).returning({ id: admins.id });
  return rows.map((row) => row.id);
};
