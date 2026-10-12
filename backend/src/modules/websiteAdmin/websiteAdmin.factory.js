// Pure DB I/O for website_schema.admin. No business rules, no HTTP types.
import { eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { websiteAdmin } from "./websiteAdmin.schema.js";

const exec = (tx) => tx ?? db;

export async function adminEmailExistsInDB(email, tx) {
  const rows = await exec(tx)
    .select({ adminId: websiteAdmin.adminId })
    .from(websiteAdmin)
    .where(eq(websiteAdmin.email, email));
  return rows.length > 0;
}

export async function getAdminByEmailInDB(email, tx) {
  const [admin] = await exec(tx).select().from(websiteAdmin).where(eq(websiteAdmin.email, email));
  return admin ?? null;
}

/** Returns only the public columns (never the password hash). */
export async function createAdminInDB(values, tx) {
  const [admin] = await exec(tx)
    .insert(websiteAdmin)
    .values(values)
    .returning({
      adminId: websiteAdmin.adminId,
      adminName: websiteAdmin.adminName,
      email: websiteAdmin.email,
    });
  return admin;
}
