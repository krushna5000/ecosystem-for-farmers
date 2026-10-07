// Optional: create the first super admin from environment variables.
//   SUPERADMIN_EMAIL=... SUPERADMIN_PASSWORD=... [SUPERADMIN_NAME=...] node scripts/seedSuperAdmin.js
// Credentials are never hard-coded; the script refuses to run without them.
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db/connection.js";
import { superAdmins } from "../src/db/schema/index.js";

const email = process.env.SUPERADMIN_EMAIL;
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME || "Super Admin";

if (!email || !password) {
  console.error("SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set.");
  process.exit(1);
}

try {
  const [existing] = await db.select({ id: superAdmins.id }).from(superAdmins).where(eq(superAdmins.email, email));
  if (existing) {
    console.log("Super admin already exists - nothing to do.");
  } else {
    await db.insert(superAdmins).values({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "super_admin",
    });
    console.log("Super admin created.");
  }
} catch (err) {
  console.error("Seeding super admin failed:", err.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
