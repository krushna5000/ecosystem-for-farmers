// Full-stack smoke test through createApp(): every portal mounted at its prefix,
// plus cross-portal token isolation.   Run from backend/:  node tests/integration.smoke.mjs
process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "integration-test-secret";
process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { db, schema: s } = await import("../src/db/index.js");
const { createApp } = await import("../src/app.js");

const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}`;
const call = async (method, path, { json, cookie } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(json ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: json ? JSON.stringify(json) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, setCookie: res.headers.get("set-cookie") };
};
const ok = (m) => console.log("  ok  ", m);

try {
  // --- every portal is mounted at its prefix (401/200 instead of the app-level 404) ---
  const mounted = {
    "GET /health": 200,
    "GET /api/website/jobs": 200,
    "GET /api/app/farms/get-all-pincodes": 401,
    "GET /api/admin/dashboard": 401,
    "GET /api/super-admin/crop-categories": 401,
    "GET /api/company-portal/company/profile": 401,
    "GET /api/vendor-portal/brands": 401,
    "GET /api/nope": 404,
  };
  for (const [k, want] of Object.entries(mounted)) {
    const [method, path] = k.split(" ");
    const r = await call(method, path);
    assert.equal(r.status, want, `${k} -> ${r.status} (wanted ${want}) ${JSON.stringify(r.data)}`);
  }
  ok("all 6 portals mounted at their prefixes");

  // --- a real farmer token (anyone can obtain one via OTP) ---
  await db.insert(s.users).values({ phoneNumber: "9000000001", fullName: "Farmer", isVerified: true });
  const farmerToken = jwt.sign({ phone_number: "9000000001" }, process.env.JWT_SECRET);
  let r = await call("GET", "/api/app/auth/verify-auth", { cookie: `token=${farmerToken}` });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  ok("farmer token works on the farmer app");

  // --- ...and must NOT authenticate against any privileged portal, under any cookie name ---
  const guarded = [
    ["/api/super-admin/crop-categories", ["super_admin_token", "token"]],
    ["/api/admin/dashboard", ["adminToken", "token"]],
    ["/api/company-portal/company/profile", ["company_token"]],
    ["/api/vendor-portal/brands", ["vendor_access_token"]],
    ["/api/website/login", ["website_admin_token", "adminToken"]],
  ];
  for (const [path, cookies] of guarded) {
    for (const name of cookies) {
      r = await call("GET", path, { cookie: `${name}=${farmerToken}` });
      assert.ok([401, 403].includes(r.status), `farmer token accepted by ${path} via ${name}: ${r.status}`);
    }
  }
  ok("farmer token rejected by super-admin, admin, company, vendor and website");

  // --- super admin: login through the full app, then use the session ---
  await db.insert(s.superAdmins).values({
    name: "Root", email: "root@test.dev", password: await bcrypt.hash("Passw0rd!", 10), role: "superadmin",
  });
  r = await call("POST", "/api/super-admin/superadmin/login", { json: { email: "root@test.dev", password: "Passw0rd!" } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.setCookie, /^super_admin_token=/);
  const saCookie = r.setCookie.split(";")[0];
  r = await call("GET", "/api/super-admin/crop-categories", { cookie: saCookie });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  ok("super admin login + session works; cookie is super_admin_token");

  // super-admin token must not open other portals either
  const saToken = saCookie.split("=")[1];
  for (const [path, name] of [
    ["/api/admin/dashboard", "adminToken"],
    ["/api/company-portal/company/profile", "company_token"],
    ["/api/vendor-portal/brands", "vendor_access_token"],
  ]) {
    r = await call("GET", path, { cookie: `${name}=${saToken}` });
    assert.ok([401, 403].includes(r.status), `super-admin token accepted by ${path}: ${r.status}`);
  }
  ok("super-admin token rejected by admin, company and vendor portals");

  // --- cross-module wiring: farmer app -> company recommendation endpoint ---
  r = await call("GET", "/api/company-portal/company/products/recommendation?cropName=wheat");
  assert.equal(r.status, 200, JSON.stringify(r.data));
  ok("company recommendation endpoint reachable (used by crop-ai)");

  console.log("\nintegration smoke test: PASS");
  server.close();
  process.exit(0);
} catch (e) {
  console.error("\nintegration smoke test: FAIL\n", e);
  server.close();
  process.exit(1);
}
