// Creates (or resets the password of) a portal admin in admins_schema.admins.
//   ADMIN_EMAIL / ADMIN_PASSWORD (and optional ADMIN_NAME) are read from .env
import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db/connection.js";
import { admins } from "../src/db/schema/index.js";

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Admin" } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  process.exit(1);
}

try {
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, ADMIN_EMAIL));
  if (existing) {
    await db.update(admins).set({ password, isActive: true }).where(eq(admins.id, existing.id));
    console.log("Admin already existed — password reset and account activated.");
  } else {
    await db.insert(admins).values({ name: ADMIN_NAME, email: ADMIN_EMAIL, password });
    console.log("Admin created.");
  }
} catch (err) {
  console.error("seed-admin failed:", err.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
