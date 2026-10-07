// Smoke test for the admin module against in-memory PostgreSQL (PGlite).
//   cd backend && node test/admin.smoke.mjs
process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "smoke-test-secret";
process.env.USE_CONSOLE_EMAIL = "true";
process.env.BASE_URL = "http://admin.test";

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

const { db } = await import("../src/db/connection.js");
const { admins, superAdmins, companyTypes, companies, vendors } = await import("../src/db/schema/index.js");
const { default: adminRouter } = await import("../src/modules/admin/index.js");
const { UPLOADS_DIR } = await import("../src/utils/storage.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/admin", adminRouter);
// same shape as src/middleware/errorHandler.js
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ success: false, message: err.message });
});
app.use((req, res) => res.status(404).json({ success: false, message: "not found" }));

const server = app.listen(0);
const base = `http://localhost:${server.address().port}/api/admin`;

let cookie = "";
const call = async (method, url, body, { auth = true, form } = {}) => {
  const headers = {};
  if (auth && cookie) headers.cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, body: json, res };
};

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const PDF = Buffer.from("%PDF-1.4\n%%EOF\n");

let step = 0;
const ok = (name) => console.log(`  ok ${++step} - ${name}`);
const uploadedFiles = [];
const localPath = (url) => path.join(UPLOADS_DIR, url.split("/uploads/")[1]);

try {
  // ---------- seed ----------
  await db.insert(admins).values([
    { name: "Root", email: "admin@farmseasy.test", password: await bcrypt.hash("secret123", 10) },
    { name: "Off", email: "off@farmseasy.test", password: await bcrypt.hash("secret123", 10), isActive: false },
  ]);
  await db.insert(superAdmins).values({ name: "SA", email: "sa@farmseasy.test", password: "x", role: "super" });
  console.log("admin auth");

  // ---------- auth ----------
  let r = await call("POST", "/login", { email: "nobody@x.test", password: "x" }, { auth: false });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, "Admin not found");
  ok("login unknown -> 404");

  r = await call("POST", "/login", { email: "off@farmseasy.test", password: "secret123" }, { auth: false });
  assert.equal(r.status, 403);
  ok("login deactivated -> 403");

  r = await call("POST", "/login", { email: "admin@farmseasy.test", password: "wrong" }, { auth: false });
  assert.equal(r.status, 401);
  assert.equal(r.body.message, "Invalid credentials");
  ok("login wrong password -> 401");

  r = await call("POST", "/login", { email: "admin@farmseasy.test", password: "secret123" }, { auth: false });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true, message: "Login successful" });
  const setCookie = r.res.headers.get("set-cookie");
  assert.match(setCookie, /^adminToken=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  cookie = setCookie.split(";")[0];
  ok("login ok sets adminToken cookie");

  r = await call("GET", "/check-auth", undefined, { auth: false });
  assert.equal(r.status, 401);
  assert.equal(r.body.message, "Not authenticated");
  r = await call("GET", "/check-auth", undefined);
  assert.equal(r.status, 200);
  assert.equal(r.body.admin.email, "admin@farmseasy.test");
  assert.ok(r.body.admin.id);
  r = await call("GET", "/dashboard");
  assert.equal(r.body.message, "Admin Dashboard");
  ok("check-auth / dashboard");

  r = await call("GET", "/companies", undefined, { auth: false });
  assert.equal(r.status, 401);
  ok("company routes protected");

  // ---------- company types ----------
  console.log("company types");
  r = await call("POST", "/company-types", { type: "Manufacturer", description: "makes" });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.type, "Manufacturer");
  const typeId = r.body.data.id;
  await call("POST", "/company-types", { type: "Distributor" });
  r = await call("GET", "/company-types");
  assert.equal(r.body.data.length, 2);
  r = await call("GET", "/company-types?page=1&limit=1");
  assert.equal(r.body.total, 2);
  assert.equal(r.body.totalPages, 2);
  assert.equal(r.body.data.length, 1);
  r = await call("PUT", `/company-types/${typeId}`, { type: "Maker", description: "d" });
  assert.equal(r.body.data.type, "Maker");
  r = await call("PUT", "/company-types/9999", { type: "x" });
  assert.equal(r.status, 404);
  r = await call("POST", "/company-types", { type: "Maker" });
  assert.equal(r.status, 500);
  assert.match(r.body.message, /duplicate key|unique/i);
  ok("company types CRUD, pagination, pg error message preserved");

  // ---------- companies ----------
  console.log("companies");
  const companyForm = (over = {}) => {
    const f = new FormData();
    const fields = {
      company_type: String(typeId),
      name: "Acme Agro",
      email: "acme@x.test",
      address: "Pune",
      gst_no: "GST001",
      phone: "9000000001",
      password: "pw123456",
      ...over,
    };
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) f.append(k, v);
    return f;
  };

  r = await call("POST", "/companies/add-company", undefined, { form: (() => { const f = new FormData(); f.append("name", "x"); return f; })() });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Missing required fields");

  r = await call("POST", "/companies/add-company", undefined, { form: companyForm({ email: "SA@farmseasy.test" }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Email already exists in system");
  ok("checkEmailExists blocks super admin email (case-insensitive)");

  const f1 = companyForm();
  f1.append("logo", new Blob([PNG], { type: "image/png" }), "logo.png");
  r = await call("POST", "/companies/add-company", undefined, { form: f1 });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  assert.equal(r.body.message, "Company registered. Verification email sent.");
  const co = r.body.data;
  for (const k of ["id", "company_type", "email", "name", "address", "gst_no", "phone", "verify_token", "logo_url", "created_at"]) {
    assert.ok(k in co, `missing key ${k}`);
  }
  assert.equal(Object.keys(co).length, 10);
  assert.match(co.logo_url, /\/uploads\/companies\/.+\.png$/);
  assert.ok(fs.existsSync(localPath(co.logo_url)));
  uploadedFiles.push(localPath(co.logo_url));
  ok("add company + logo upload -> 201, snake_case keys");

  r = await call("POST", "/companies/add-company", undefined, { form: companyForm({ email: "other@x.test" }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.field, "gst_no");
  r = await call("POST", "/companies/add-company", undefined, { form: companyForm({ email: "acme@x.test", gst_no: "G2" }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Email already exists in system");
  r = await call("POST", "/companies/add-company", undefined, { form: companyForm({ email: "o2@x.test", gst_no: "G3" }) });
  assert.equal(r.body.field, "phone");
  ok("duplicate gst / email / phone rejected");

  const bad = companyForm({ email: "bad@x.test", gst_no: "G9", phone: "9000000009" });
  bad.append("logo", new Blob(["x"], { type: "application/pdf" }), "a.pdf");
  r = await call("POST", "/companies/add-company", undefined, { form: bad });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /Only image files are allowed/);
  ok("logo mime filter");

  // company without a password (set later via reset link)
  r = await call("POST", "/companies/add-company", undefined, {
    form: companyForm({ email: "nopw@x.test", gst_no: "G4", phone: "9000000004", password: undefined }),
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const coNoPw = r.body.data;
  ok("add company without password");

  r = await call("GET", "/companies");
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 2);
  assert.equal(r.body.data[0].id, coNoPw.id); // ORDER BY id DESC
  const row = r.body.data.find((c) => c.id === co.id);
  assert.equal(row.company_type_name, "Maker");
  for (const k of ["gst_no", "is_active", "is_approved", "is_delete", "verify_token", "logo_url", "created_at", "company_type", "llp_no"]) {
    assert.ok(k in row, `missing key ${k}`);
  }
  r = await call("GET", "/companies?page=1&limit=1");
  assert.equal(r.body.total, 2);
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.totalPages, 2);
  r = await call("GET", `/companies/${co.id}`);
  assert.equal(r.body.data.name, "Acme Agro");
  assert.equal(r.body.data.company_type_name, "Maker");
  r = await call("GET", "/companies/9999");
  assert.equal(r.status, 404);
  ok("list / paginate / get by id (joined company_type_name)");

  r = await call("PUT", `/companies/${co.id}`, { name: "Acme 2", phone: "", is_active: false });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.name, "Acme 2");
  assert.equal(r.body.data.phone, "9000000001"); // blank keeps value
  assert.equal(r.body.data.is_active, false);
  assert.equal(r.body.data.gst_no, "GST001");
  const uf = new FormData();
  uf.append("address", "Mumbai");
  uf.append("logo", new Blob([PNG], { type: "image/png" }), "n.png");
  r = await call("PUT", `/companies/${co.id}`, undefined, { form: uf });
  assert.equal(r.body.data.address, "Mumbai");
  assert.notEqual(r.body.data.logo_url, co.logo_url);
  uploadedFiles.push(localPath(r.body.data.logo_url));
  r = await call("PUT", "/companies/9999", { name: "x" });
  assert.equal(r.status, 404);
  r = await call("PUT", `/companies/${co.id}`, { phone: "9000000004" });
  assert.equal(r.status, 500);
  assert.match(r.body.message, /duplicate key|unique/i);
  ok("update (COALESCE semantics, logo, 404, unique violation)");

  r = await call("PATCH", `/companies/${co.id}/toggle-active`);
  assert.equal(r.body.message, "Company is now ACTIVE");
  assert.equal(r.body.data.is_active, true);
  r = await call("PATCH", "/companies/9999/toggle-active");
  assert.equal(r.status, 404);
  ok("toggle-active");

  // OTP on every reachable path
  for (const prefix of ["/companies", "/company-otp"]) {
    r = await call("POST", `${prefix}/otp/send`, { company_id: co.id }, { auth: false });
    assert.equal(r.status, 400);
    r = await call("POST", `${prefix}/otp/send`, { company_id: 9999, phone: "1" }, { auth: false });
    assert.equal(r.status, 404);
    r = await call("POST", `${prefix}/otp/send`, { company_id: co.id, phone: "9000000001" }, { auth: false });
    assert.equal(r.status, 200);
    assert.match(r.body.otp, /^\d{6}$/);
    assert.ok(r.body.expires_at);
    const otp = r.body.otp;
    r = await call("POST", `${prefix}/otp/verify`, { company_id: co.id, otp_code: otp === "000000" ? "111111" : "000000" }, { auth: false });
    assert.equal(r.status, 400);
    assert.equal(r.body.message, "Invalid OTP");
    await db.update(companies).set({ isApproved: false }).where((await import("drizzle-orm")).eq(companies.id, co.id));
    r = await call("POST", `${prefix}/otp/verify`, { company_id: co.id, otp_code: otp }, { auth: false });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.company.is_approved, true);
    assert.deepEqual(Object.keys(r.body.company).sort(), ["email", "gst_no", "id", "is_approved", "name", "phone"]);
  }
  r = await call("POST", "/companies/otp/verify", { company_id: coNoPw.id, otp_code: "123456" }, { auth: false });
  assert.equal(r.status, 404);
  assert.equal(r.body.message, "OTP not found");
  ok("company OTP send/verify on /companies and /company-otp");

  // verify-email -> reset-password flow
  r = await call("GET", `/companies/company/verify-email/${coNoPw.verify_token}`, undefined, { auth: false });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "Email verified successfully. Approval email sent.");
  assert.notEqual(r.body.token, coNoPw.verify_token);
  const resetToken = r.body.token;
  r = await call("GET", "/companies/company/verify-email/not-a-token", undefined, { auth: false });
  assert.equal(r.body.message, "Email already verified."); // legacy fallback to latest approved company
  r = await call("POST", `/companies/company/reset-password/${resetToken}`, {}, { auth: false });
  assert.equal(r.status, 400);
  r = await call("POST", `/companies/company/reset-password/${resetToken}`, { newPassword: "newpass1" }, { auth: false });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "Password reset successfully");
  const [stored] = await db.select().from(companies).where((await import("drizzle-orm")).eq(companies.id, coNoPw.id));
  assert.equal(stored.verifyToken, null);
  assert.equal(stored.isApproved, true);
  assert.ok(await bcrypt.compare("newpass1", stored.password));
  r = await call("POST", `/companies/company/reset-password/${resetToken}`, { newPassword: "again" }, { auth: false });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Invalid or expired reset token");
  ok("company verify-email + reset-password flow");

  r = await call("DELETE", `/companies/${co.id}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.deleted_company.id, co.id);
  r = await call("DELETE", `/companies/${co.id}`);
  assert.equal(r.status, 404);
  r = await call("POST", "/companies/bulk-delete", { ids: [] });
  assert.equal(r.status, 400);
  r = await call("POST", "/companies/bulk-delete", { ids: [9998, 9999] });
  assert.equal(r.status, 404);
  r = await call("POST", "/companies/bulk-delete", { ids: [coNoPw.id] });
  assert.equal(r.body.deletedCount, 1);
  assert.equal(r.body.deletedCompanies[0].id, coNoPw.id);
  ok("delete / bulk-delete companies");

  // ---------- vendors ----------
  console.log("vendors");
  const vendorForm = (over = {}, files = {}) => {
    const f = new FormData();
    const fields = { name: "Green Vendor", email: "vendor@x.test", phone: "8000000001", gst_no: "VG1", pan_no: "PAN1", password: "vpw12345", ...over };
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) f.append(k, v);
    for (const [k, v] of Object.entries(files)) f.append(k, new Blob([v.data], { type: v.type }), v.name);
    return f;
  };

  r = await call("POST", "/vendors", undefined, { form: vendorForm({ name: undefined }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Name, email, and phone are required");
  r = await call("POST", "/vendors", undefined, { form: vendorForm({ email: "admin@farmseasy.test" }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Email already exists in system");
  r = await call("POST", "/vendors", undefined, {
    form: vendorForm({}, { gst_pdf: { data: PNG, type: "image/png", name: "x.png" } }),
  });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /Only PDF files are allowed/);
  ok("vendor validation + PDF-only filter");

  r = await call("POST", "/vendors", undefined, {
    form: vendorForm({}, {
      gst_pdf: { data: PDF, type: "application/pdf", name: "gst.pdf" },
      pan_pdf: { data: PDF, type: "application/pdf", name: "pan.pdf" },
    }),
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const v = r.body.data;
  for (const k of ["shop_act_pdf", "gst_pdf", "licence_pdf", "pan_pdf", "is_active", "is_approve", "is_delete", "verify_token", "created_at", "shop_act_no"]) {
    assert.ok(k in v, `missing key ${k}`);
  }
  assert.equal(v.is_active, false);
  assert.equal(v.is_approve, false);
  assert.match(v.gst_pdf, /\/uploads\/vendors\/\d+-gst_pdf\.pdf$/);
  assert.ok(fs.existsSync(localPath(v.gst_pdf)));
  assert.ok(fs.existsSync(localPath(v.pan_pdf)));
  assert.equal(v.shop_act_pdf, null);
  uploadedFiles.push(localPath(v.gst_pdf), localPath(v.pan_pdf));
  ok("add vendor + PDFs -> 201 (is_active/is_approve false, vendors/ keys)");

  r = await call("POST", "/vendors", undefined, { form: vendorForm({ email: "v2@x.test" }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Vendor email or phone already exists");
  ok("vendor duplicate phone rejected");

  r = await call("GET", "/vendors");
  assert.equal(r.body.count, 1);
  assert.equal(r.body.data[0].id, v.id);
  r = await call("GET", "/vendors?limit=5");
  assert.equal(r.body.total, 1);
  assert.equal(r.body.totalPages, 1);
  ok("list vendors (+pagination)");

  const vu = vendorForm({ name: "Renamed", password: undefined, email: undefined, phone: undefined, gst_no: undefined, pan_no: undefined }, {
    shop_act_pdf: { data: PDF, type: "application/pdf", name: "s.pdf" },
  });
  r = await call("PUT", `/vendors/${v.id}`, undefined, { form: vu });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.data.name, "Renamed");
  assert.equal(r.body.data.gst_no, "VG1");
  assert.equal(r.body.data.gst_pdf, v.gst_pdf);
  assert.match(r.body.data.shop_act_pdf, /\/uploads\/vendors\//);
  uploadedFiles.push(localPath(r.body.data.shop_act_pdf));
  r = await call("PUT", "/vendors/9999", { name: "x" });
  assert.equal(r.status, 404);
  r = await call("PUT", `/vendors/${v.id}`, { is_active: true });
  assert.equal(r.body.data.is_active, true);
  ok("update vendor (COALESCE, PDF upload, 404)");

  r = await call("PATCH", `/vendors/${v.id}/toggle-active`);
  assert.equal(r.body.message, "Vendor is now INACTIVE");
  assert.equal(r.body.data.is_active, false);
  ok("toggle vendor");

  for (const prefix of ["/vendors", "/vendor-otp/vendors"]) {
    r = await call("POST", `${prefix}/otp/send`, { vendor_id: v.id }, { auth: false });
    assert.equal(r.status, 400);
    r = await call("POST", `${prefix}/otp/send`, { vendor_id: 9999, email: "a@b.c" }, { auth: false });
    assert.equal(r.status, 404);
    r = await call("POST", `${prefix}/otp/send`, { vendor_id: v.id, email: "vendor@x.test" }, { auth: false });
    assert.equal(r.status, 200);
    const otp = r.body.otp;
    r = await call("POST", `${prefix}/otp/verify`, { vendor_id: v.id, otp: otp === "000000" ? "111111" : "000000" }, { auth: false });
    assert.equal(r.body.message, "Invalid OTP");
    r = await call("POST", `${prefix}/otp/verify`, { vendor_id: v.id, otp }, { auth: false });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.vendor.is_approve, true);
    assert.deepEqual(Object.keys(r.body.vendor).sort(), ["email", "id", "is_approve", "name", "phone"]);
  }
  ok("vendor OTP send/verify on /vendors and /vendor-otp/vendors");

  // verify-email -> reset-password flow with a fresh vendor
  r = await call("POST", "/vendors", undefined, { form: vendorForm({ email: "v3@x.test", phone: "8000000003", password: undefined }) });
  assert.equal(r.status, 201);
  const v3 = r.body.data;
  r = await call("GET", `/vendors/verify-email/${v3.verify_token}`, undefined, { auth: false });
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "Email verified. Please set your password.");
  const vReset = r.body.token;
  const [v3row] = await db.select().from(vendors).where((await import("drizzle-orm")).eq(vendors.id, v3.id));
  assert.equal(v3row.isActive, true);
  assert.equal(v3row.isApprove, true);
  r = await call("POST", `/vendors/reset-password/${vReset}`, {}, { auth: false });
  assert.equal(r.status, 400);
  r = await call("POST", `/vendors/reset-password/${vReset}`, { newPassword: "vnew1234" }, { auth: false });
  assert.equal(r.body.message, "Vendor password reset successfully");
  r = await call("POST", `/vendors/reset-password/${vReset}`, { newPassword: "x" }, { auth: false });
  assert.equal(r.status, 400);
  assert.equal(r.body.message, "Invalid or expired reset token");
  ok("vendor verify-email + reset-password flow");

  // delete removes the stored PDFs
  r = await call("DELETE", `/vendors/${v.id}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "Vendor deleted permanently");
  assert.equal(r.body.data.id, v.id);
  assert.equal(fs.existsSync(localPath(v.gst_pdf)), false);
  assert.equal(fs.existsSync(localPath(v.pan_pdf)), false);
  r = await call("DELETE", `/vendors/${v.id}`);
  assert.equal(r.status, 404);
  r = await call("POST", "/vendors/bulk-delete", {});
  assert.equal(r.status, 400);
  r = await call("POST", "/vendors/bulk-delete", { ids: [9999] });
  assert.equal(r.status, 404);
  r = await call("POST", "/vendors/bulk-delete", { ids: [v3.id] });
  assert.equal(r.body.deletedCount, 1);
  assert.equal(r.body.deletedVendors[0].id, v3.id);
  ok("delete vendor removes PDFs; bulk-delete");

  // ---------- logout ----------
  r = await call("POST", "/logout");
  assert.equal(r.status, 200);
  assert.equal(r.body.message, "Logout successful");
  assert.match(r.res.headers.get("set-cookie"), /adminToken=;/);
  ok("logout clears cookie");

  console.log(`\nadmin smoke test PASSED (${step} checks)`);
  process.exitCode = 0;
} catch (err) {
  console.error("\nadmin smoke test FAILED");
  console.error(err);
  process.exitCode = 1;
} finally {
  for (const f of uploadedFiles) fs.rmSync(f, { force: true });
  for (const d of ["companies", "vendors"]) {
    const dir = path.join(UPLOADS_DIR, d);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
  if (fs.existsSync(UPLOADS_DIR) && fs.readdirSync(UPLOADS_DIR).length === 0) fs.rmdirSync(UPLOADS_DIR);
  server.close();
  process.exit(process.exitCode ?? 1);
}
