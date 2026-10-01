import { sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { db } from "../../../db/index.js";
import { superAdmins, admins, vendors, companies } from "../../../db/schema/index.js";

const source = (name) => sql`${name}::text`.as("source");
const sameEmail = (col, email) => sql`LOWER(${col}) = LOWER(${email})`;

/** Looks the email up across super admins, admins, vendors and companies. */
export const checkEmailExists = async (email) => {
  try {
    const rows = await unionAll(
      db.select({ source: source("superadmin") }).from(superAdmins).where(sameEmail(superAdmins.email, email)),
      db.select({ source: source("admin") }).from(admins).where(sameEmail(admins.email, email)),
      db.select({ source: source("vendor") }).from(vendors).where(sameEmail(vendors.email, email)),
      db.select({ source: source("company") }).from(companies).where(sameEmail(companies.email, email)),
    );

    if (rows.length > 0) {
      return { exists: true, foundIn: rows[0].source };
    }

    return { exists: false, foundIn: null };
  } catch (error) {
    console.error("checkEmailExists error:", error.cause?.message || error.message);
    // do not block the operation if the lookup itself fails
    return { exists: false, foundIn: null, error: error.cause?.message || error.message };
  }
};
