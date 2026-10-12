// Pure DB I/O for admins_schema.admins and the cross-identity email lookup. No business rules, no req/res.
import { eq, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { db } from "../../db/connection.js";
import { admins, superAdmins, vendors, companies } from "./adminAuth.schema.js";

const exec = (tx) => tx ?? db;

const source = (name) => sql`${name}::text`.as("source");
const sameEmail = (col, email) => sql`LOWER(${col}) = LOWER(${email})`;

export async function findAdminByEmailInDB(email, tx) {
  const [admin] = await exec(tx).select().from(admins).where(eq(admins.email, email));
  return admin ?? null;
}

/** Which identity tables (super admins, admins, vendors, companies) hold this email — one `{ source }` row per hit. */
export function findEmailSourcesInDB(email, tx) {
  const q = exec(tx);
  return unionAll(
    q.select({ source: source("superadmin") }).from(superAdmins).where(sameEmail(superAdmins.email, email)),
    q.select({ source: source("admin") }).from(admins).where(sameEmail(admins.email, email)),
    q.select({ source: source("vendor") }).from(vendors).where(sameEmail(vendors.email, email)),
    q.select({ source: source("company") }).from(companies).where(sameEmail(companies.email, email)),
  );
}
