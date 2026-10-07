// Creates one development login for the company, vendor and website-admin portals
// (idempotent; re-running resets the passwords to the values in .env).
//   COMPANY_EMAIL / COMPANY_PASSWORD, VENDOR_EMAIL / VENDOR_PASSWORD,
//   WEBSITE_ADMIN_EMAIL / WEBSITE_ADMIN_PASSWORD
import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, closeDb } from "../src/db/connection.js";
import { companyTypes, companies, vendors, websiteAdmin } from "../src/db/schema/index.js";

const need = (k) => {
  if (!process.env[k]) throw new Error(`${k} is not set in .env`);
  return process.env[k];
};
const hash = (pw) => bcrypt.hash(pw, 10);

try {
  // ---- company portal
  const companyEmail = need("COMPANY_EMAIL");
  const companyPw = await hash(need("COMPANY_PASSWORD"));
  let [type] = await db.select().from(companyTypes).where(eq(companyTypes.type, "Pesticide Manufacturer"));
  if (!type) [type] = await db.insert(companyTypes).values({ type: "Pesticide Manufacturer", description: "Dev seed" }).returning();
  const [co] = await db.select({ id: companies.id }).from(companies).where(eq(companies.email, companyEmail));
  if (co) {
    await db.update(companies).set({ password: companyPw, isActive: true, isApproved: true }).where(eq(companies.id, co.id));
  } else {
    await db.insert(companies).values({
      companyType: type.id, name: "Dev Agro Company", address: "Dev address", gstNo: "DEVGST0000000001",
      email: companyEmail, phone: "9000000010", password: companyPw, isActive: true, isApproved: true,
    });
  }
  console.log("company login ready:", companyEmail);

  // ---- vendor portal
  const vendorEmail = need("VENDOR_EMAIL");
  const vendorPw = await hash(need("VENDOR_PASSWORD"));
  const [v] = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.email, vendorEmail));
  if (v) {
    await db.update(vendors).set({ password: vendorPw, isActive: true, isApprove: true }).where(eq(vendors.id, v.id));
  } else {
    await db.insert(vendors).values({
      name: "Dev Vendor", email: vendorEmail, phone: "9000000020", password: vendorPw, isActive: true, isApprove: true,
    });
  }
  console.log("vendor login ready:", vendorEmail);

  // ---- website CMS admin
  const siteEmail = need("WEBSITE_ADMIN_EMAIL");
  const sitePw = await hash(need("WEBSITE_ADMIN_PASSWORD"));
  const [w] = await db.select({ id: websiteAdmin.adminId }).from(websiteAdmin).where(eq(websiteAdmin.email, siteEmail));
  if (w) {
    await db.update(websiteAdmin).set({ passwordHash: sitePw, isActive: true }).where(eq(websiteAdmin.adminId, w.id));
  } else {
    await db.insert(websiteAdmin).values({ adminId: crypto.randomUUID(), adminName: "Website Admin", email: siteEmail, passwordHash: sitePw });
  }
  console.log("website admin login ready:", siteEmail);
} catch (err) {
  console.error("seed-dev-users failed:", err.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
