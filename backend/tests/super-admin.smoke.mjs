// Smoke test for the super admin module. Run from backend/:
//   DB_DRIVER=pglite node tests/super-admin.smoke.mjs
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";

process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "smoke-test-secret";

const { default: superAdminRouter } = await import("../src/modules/superAdmin/index.js");
const { db } = await import("../src/db/index.js");
const { superAdmins, vendors, crops } = await import("../src/db/schema/index.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/super-admin", superAdminRouter);

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/super-admin`;

let cookie;
const call = async (method, path, { json, auth = true } = {}) => {
  const headers = {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (auth && cookie) headers.Cookie = cookie;
  const res = await fetch(base + path, { method, headers, body });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data, res };
};

let failed = false;
const PASSWORD = "Sm0ke-Test-pw";

try {
  await db.insert(superAdmins).values({
    name: "Root",
    email: "root@example.test",
    password: await bcrypt.hash(PASSWORD, 10),
    role: "super_admin",
  });

  /* ---------- auth ---------- */
  let r = await call("GET", "/crop-categories", { auth: false });
  assert.equal(r.status, 401);
  assert.equal(r.data.message, "Unauthorized - No token provided");

  r = await call("GET", "/crop-categories", { auth: false, json: undefined });
  r = await fetch(base + "/crop-categories", { headers: { Cookie: "super_admin_token=garbage" } });
  assert.equal(r.status, 401);
  assert.equal((await r.json()).message, "Invalid or expired token");

  // login attempt 1: no body at all (Express 5 leaves req.body undefined)
  r = await call("POST", "/superadmin/login");
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Email and password are required");

  // attempt 2: wrong password, attempt 3: unknown email
  r = await call("POST", "/superadmin/login", { json: { email: "root@example.test", password: "nope" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Invalid email or password");
  r = await call("POST", "/superadmin/login", { json: { email: "who@example.test", password: "nope" } });
  assert.equal(r.status, 400);

  // attempt 4: success
  r = await call("POST", "/superadmin/login", { json: { email: "root@example.test", password: PASSWORD } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { success: true, message: "Login successful" });
  const setCookie = r.res.headers.get("set-cookie");
  assert.match(setCookie, /^super_admin_token=/);
  assert.match(setCookie, /HttpOnly/i);
  cookie = setCookie.split(";")[0];

  r = await call("GET", "/superadmin/check-auth");
  assert.equal(r.status, 200);
  assert.equal(r.data.authenticated, true);
  assert.ok(r.data.user.id);

  /* ---------- admins ---------- */
  r = await call("POST", "/admin", { json: { name: "x" } });
  assert.equal(r.status, 400);

  r = await call("POST", "/admin", { json: { name: "  Alice ", email: "alice@example.test", password: "pw-alice-1" } });
  assert.equal(r.status, 201);
  assert.deepEqual(Object.keys(r.data.data).sort(), ["created_at", "email", "id", "name"]);
  assert.equal(r.data.data.name, "Alice");
  const adminId = r.data.data.id;

  // duplicate across the whole system (admin, super admin, vendor)
  r = await call("POST", "/admin", { json: { name: "A2", email: "ALICE@example.test", password: "x" } });
  assert.equal(r.status, 409);
  r = await call("POST", "/admin", { json: { name: "A3", email: "root@example.test", password: "x" } });
  assert.equal(r.status, 409);
  await db.insert(vendors).values({ name: "V", email: "vendor@example.test", phone: "9999999999" });
  r = await call("POST", "/admin", { json: { name: "A4", email: "vendor@example.test", password: "x" } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "Email already exists in system");

  r = await call("POST", "/admin", { json: { name: "Bob", email: "bob@example.test", password: "pw-bob-1" } });
  const bobId = r.data.data.id;

  r = await call("GET", "/admin");
  assert.equal(r.status, 200);
  assert.equal(r.data.total, 2);
  assert.deepEqual(Object.keys(r.data.data[0]).sort(), ["email", "id", "name"]);

  r = await call("PUT", `/admin/${adminId}`, { json: { name: "Alice B", email: "aliceb@example.test" } });
  assert.equal(r.status, 200);
  r = await call("PUT", "/admin/abc", { json: { name: "a", email: "b" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Invalid admin id");
  r = await call("PUT", "/admin/9999", { json: { name: "a", email: "b" } });
  assert.equal(r.status, 404);

  r = await call("PUT", `/admin/password/${adminId}`, { json: { newPassword: "pw-alice-1" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "New password cannot be same as current password");
  r = await call("PUT", `/admin/password/${adminId}`, { json: { newPassword: "pw-alice-2" } });
  assert.equal(r.status, 200);
  r = await call("PUT", `/admin/password/${adminId}`, { json: {} });
  assert.equal(r.status, 400);

  r = await call("DELETE", `/admin/${adminId}`);
  assert.equal(r.status, 200);
  r = await call("DELETE", `/admin/${adminId}`);
  assert.equal(r.status, 404);

  r = await call("DELETE", "/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/bulk-delete", { json: { ids: [9999] } });
  assert.equal(r.status, 404);
  r = await call("DELETE", "/bulk-delete", { json: { ids: [bobId, 9999] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 1);
  assert.deepEqual(r.data.deletedIds, [bobId]);
  r = await call("GET", "/admin");
  assert.equal(r.data.message, "No admins found");

  /* ---------- crop categories ---------- */
  r = await call("POST", "/crop-categories", { json: {} });
  assert.equal(r.status, 400);
  r = await call("POST", "/crop-categories", { json: { category_name: "Cereals", description: "grains" } });
  assert.equal(r.status, 201);
  assert.equal(r.data.data.category_name, "Cereals");
  assert.ok("created_at" in r.data.data);
  const catId = r.data.data.id;
  r = await call("POST", "/crop-categories", { json: { category_name: "Cereals" } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "Category name already exists");
  r = await call("POST", "/crop-categories", { json: { category_name: "Pulses" } });
  const cat2 = r.data.data.id;

  r = await call("GET", "/crop-categories?page=1&limit=1");
  assert.equal(r.status, 200);
  assert.equal(r.data.data.length, 1);
  assert.deepEqual(r.data.pagination, {
    currentPage: 1,
    itemsPerPage: 1,
    totalItems: 2,
    totalPages: 2,
    hasNextPage: true,
    hasPrevPage: false,
  });
  r = await call("GET", `/crop-categories/${catId}`);
  assert.equal(r.data.data.category_name, "Cereals");
  r = await call("GET", "/crop-categories/abc");
  assert.equal(r.status, 400);
  r = await call("GET", "/crop-categories/9999");
  assert.equal(r.status, 404);
  r = await call("PUT", `/crop-categories/${catId}`, { json: { category_name: "Pulses" } });
  assert.equal(r.status, 409);
  r = await call("PUT", `/crop-categories/${catId}`, { json: { category_name: "Cereals+" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.data.description, null); // description omitted => NULL, as before
  r = await call("DELETE", "/crop-categories/9999");
  assert.equal(r.status, 404);

  /* ---------- crop stages ---------- */
  r = await call("POST", "/crop-stages", { json: {} });
  assert.equal(r.status, 400);
  const stageIds = [];
  for (const name of ["Sowing", "Growth", "Harvest"]) {
    r = await call("POST", "/crop-stages", { json: { stage_name: name, description: `${name} stage` } });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    stageIds.push(r.data.data.id);
  }
  r = await call("POST", "/crop-stages", { json: { stage_name: "sowing" } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "Crop stage already exists");
  r = await call("PUT", `/crop-stages/${stageIds[1]}`, { json: { stage_name: "Sowing" } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "Stage name already exists");
  r = await call("PUT", `/crop-stages/${stageIds[1]}`, { json: { stage_name: "Growing", description: "d" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.data.stage_name, "Growing");
  r = await call("GET", "/crop-stages");
  assert.equal(r.data.pagination.totalItems, 3);
  r = await call("GET", `/crop-stages/${stageIds[0]}`);
  assert.equal(r.data.data.stage_name, "Sowing");
  r = await call("GET", "/crop-stages/9999");
  assert.equal(r.status, 404);

  /* ---------- crops (jsonb stage arrays) ---------- */
  r = await call("POST", "/crops/add", { json: { crop_name: "Wheat" } });
  assert.equal(r.status, 400);
  r = await call("POST", "/crops/add", { json: { category_id: catId, crop_name: "Wheat", crop_stages_id: "x" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Invalid crop_stages_id");
  r = await call("POST", "/crops/add", { json: { category_id: 9999, crop_name: "Wheat", t_base: 5 } });
  assert.equal(r.status, 404);
  assert.equal(r.data.message, "Invalid category_id");

  r = await call("POST", "/crops/add", {
    json: {
      category_id: catId,
      crop_name: "Wheat",
      crop_stages_id: [{ id: stageIds[0] }, { id: stageIds[1] }, { id: stageIds[2] }],
      t_base: 0,
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.data.t_base, 0);
  assert.equal(r.data.data.category_id, catId);
  assert.deepEqual(r.data.data.crop_stage_id, [{ id: stageIds[0] }, { id: stageIds[1] }, { id: stageIds[2] }]);
  const wheatId = r.data.data.id;

  r = await call("POST", "/crops/add", { json: { category_id: cat2, crop_name: "Gram", t_base: 8 } });
  assert.equal(r.status, 201);
  assert.equal(r.data.data.crop_stage_id, null);
  const gramId = r.data.data.id;

  r = await call("GET", "/crops/all?page=1&limit=10");
  assert.equal(r.status, 200);
  assert.equal(r.data.pagination.totalItems, 2);
  const wheat = r.data.data.find((c) => c.id === wheatId);
  assert.deepEqual(
    Object.keys(wheat).sort(),
    ["category_id", "category_name", "created_at", "crop_name", "crop_stage_id", "crop_stages", "id", "t_base"],
  );
  assert.equal(wheat.category_name, "Cereals+");
  assert.deepEqual(wheat.crop_stages.map((s) => s.stage_name).sort(), ["Growing", "Harvest", "Sowing"]);
  assert.deepEqual(Object.keys(wheat.crop_stages[0]).sort(), ["description", "id", "stage_name"]);
  const gram = r.data.data.find((c) => c.id === gramId);
  assert.deepEqual(gram.crop_stages, []);

  r = await call("PUT", `/crops/update/${gramId}`, { json: { crop_name: "Chickpea", crop_stages_id: [{ id: stageIds[0] }] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.data.crop_name, "Chickpea");
  assert.equal(r.data.data.t_base, 8); // untouched (COALESCE semantics)
  r = await call("PUT", `/crops/update/${gramId}`, { json: {} });
  assert.equal(r.status, 200);
  assert.equal(r.data.data.crop_name, "Chickpea");
  r = await call("PUT", "/crops/update/abc", { json: {} });
  assert.equal(r.status, 400);
  r = await call("PUT", "/crops/update/9999", { json: {} });
  assert.equal(r.status, 404);

  // deleting stages strips them out of every crop's jsonb array (transactional)
  r = await call("DELETE", `/crop-stages/${stageIds[1]}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.message, "Crop stage deleted permanently");
  let [row] = await db.select().from(crops).where((await import("drizzle-orm")).eq(crops.id, wheatId));
  assert.deepEqual(row.cropStageId, [{ id: stageIds[0] }, { id: stageIds[2] }]);
  r = await call("DELETE", `/crop-stages/${stageIds[1]}`);
  assert.equal(r.status, 404);
  r = await call("DELETE", "/crop-stages/abc");
  assert.equal(r.status, 400);

  r = await call("DELETE", "/crop-stages/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/crop-stages/bulk-delete", { json: { ids: [9999] } });
  assert.equal(r.status, 404);
  r = await call("DELETE", "/crop-stages/bulk-delete", { json: { ids: [stageIds[0], stageIds[2]] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 2);
  [row] = await db.select().from(crops).where((await import("drizzle-orm")).eq(crops.id, wheatId));
  assert.equal(row.cropStageId, null); // all stages removed => jsonb_agg of nothing => NULL (as before)

  r = await call("DELETE", `/crops/delete/${gramId}`);
  assert.equal(r.status, 200);
  r = await call("DELETE", `/crops/delete/${gramId}`);
  assert.equal(r.status, 404);
  r = await call("DELETE", "/crops/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/crops/bulk-delete", { json: { ids: [9999] } });
  assert.equal(r.status, 404);
  r = await call("DELETE", "/crops/bulk-delete", { json: { ids: [wheatId] } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.deletedIds, [wheatId]);

  r = await call("DELETE", "/crop-categories/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/crop-categories/bulk-delete", { json: { ids: [9999] } });
  assert.equal(r.status, 404);
  r = await call("DELETE", `/crop-categories/${cat2}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.data.category_name, "Pulses");
  r = await call("DELETE", "/crop-categories/bulk-delete", { json: { ids: [catId] } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.deletedIds, [catId]);

  /* ---------- location ---------- */
  r = await call("POST", "/location/states", { json: {} });
  assert.equal(r.status, 400);
  r = await call("POST", "/location/states", { json: { state_name: "Maharashtra" } });
  assert.equal(r.status, 201);
  assert.deepEqual(Object.keys(r.data.state).sort(), ["created_at", "is_active", "state_id", "state_name", "updated_at"]);
  const stateId = r.data.state.state_id;
  r = await call("POST", "/location/states", { json: { state_name: "maharashtra" } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "State already exists");
  r = await call("POST", "/location/states", { json: { state_name: "Goa" } });
  const goaId = r.data.state.state_id;
  r = await call("GET", "/location/states?limit=1");
  assert.equal(r.data.states.length, 1);
  assert.equal(r.data.pagination.totalItems, 2);
  r = await call("GET", `/location/states/${stateId}`);
  assert.equal(r.data.state.state_name, "Maharashtra");
  r = await call("GET", "/location/states/9999");
  assert.equal(r.status, 404);
  assert.equal(r.data.error, "State not found");
  r = await call("PUT", `/location/states/${goaId}`, { json: { state_name: "MAHARASHTRA" } });
  assert.equal(r.status, 409);
  r = await call("PUT", `/location/states/${goaId}`, { json: { state_name: "Goa State" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.state.state_name, "Goa State");

  r = await call("POST", "/location/districts", { json: { district_name: "Pune" } });
  assert.equal(r.status, 400);
  r = await call("POST", "/location/districts", { json: { district_name: "Pune", state_id: stateId } });
  assert.equal(r.status, 201);
  const districtId = r.data.district.district_id;
  r = await call("POST", "/location/districts", { json: { district_name: "pune", state_id: stateId } });
  assert.equal(r.status, 409);
  r = await call("PUT", `/location/districts/${districtId}`, { json: { district_name: " Pune City ", state_id: stateId } });
  assert.equal(r.data.district.district_name, "Pune City");

  r = await call("POST", "/location/cities", { json: { city_name: "Pimpri", district_id: districtId } });
  assert.equal(r.status, 201);
  const cityId = r.data.city.city_id;
  r = await call("POST", "/location/cities", { json: { city_name: "PIMPRI", district_id: districtId } });
  assert.equal(r.status, 409);

  r = await call("POST", "/location/villages", { json: { village_name: "Akurdi", city_id: cityId } });
  assert.equal(r.status, 201);
  const villageId = r.data.village.village_id;
  r = await call("POST", "/location/villages", { json: { village_name: "akurdi", city_id: cityId } });
  assert.equal(r.status, 409);

  r = await call("POST", "/location/pincode", { json: { pincode: "411035", village_id: villageId } });
  assert.equal(r.status, 201);
  const pincodeId = r.data.pincode.pincode_id;
  r = await call("POST", "/location/pincode", { json: { pincode: "411035", village_id: villageId } });
  assert.equal(r.status, 409);
  assert.equal(r.data.message, "Pincode already exists for this village");
  r = await call("GET", "/location/pincodes");
  assert.equal(r.data.pincodes.length, 1);
  assert.equal(r.data.pincodes[0].pincode, "411035");

  r = await call("GET", "/location/hierarchy");
  assert.equal(r.status, 200);
  assert.equal(r.data.hierarchy.length, 2);
  const mh = r.data.hierarchy.find((s) => s.state_id === stateId);
  assert.equal(mh.districts[0].cities[0].villages[0].pincodes[0].pincode, "411035");
  assert.deepEqual(r.data.hierarchy.find((s) => s.state_id === goaId).districts, []);

  // toggle: disable district cascades down; enabling a child under an inactive parent is blocked
  r = await call("PUT", `/location/districts/${districtId}/toggle-active`);
  assert.equal(r.status, 200);
  assert.equal(r.data.district.is_active, false);
  for (const [path, key, id] of [
    ["cities", "city", cityId],
    ["villages", "village", villageId],
    ["pincodes", "pincode", pincodeId],
  ]) {
    r = await call("GET", `/location/${path}/${id}`);
    assert.equal(r.data[key].is_active, false, `${key} should be disabled by cascade`);
  }
  r = await call("PUT", `/location/cities/${cityId}/toggle-active`);
  assert.equal(r.status, 400);
  assert.equal(r.data.message, 'Cannot enable city. Please enable the parent District "Pune City" first.');
  r = await call("PUT", `/location/villages/${villageId}/toggle-active`);
  assert.equal(r.status, 400);
  assert.equal(
    r.data.message,
    'Cannot enable village. Please enable the parent District "Pune City" and City "Pimpri" first.',
  );
  r = await call("PUT", `/location/pincodes/${pincodeId}/toggle-active`);
  assert.equal(r.status, 400);
  assert.equal(
    r.data.message,
    'Cannot enable pincode. Please enable the parent District "Pune City", City "Pimpri", Village "Akurdi" first.',
  );
  r = await call("PUT", "/location/districts/9999/toggle-active");
  assert.equal(r.status, 404);
  assert.equal(r.data.message, "District not found");

  for (const [path, key, id] of [
    ["districts", "district", districtId],
    ["cities", "city", cityId],
    ["villages", "village", villageId],
    ["pincodes", "pincode", pincodeId],
  ]) {
    r = await call("PUT", `/location/${path}/${id}/toggle-active`);
    assert.equal(r.status, 200, `${key}: ${JSON.stringify(r.data)}`);
    assert.equal(r.data[key].is_active, true);
  }

  // update pincode re-activates it
  r = await call("PUT", `/location/pincodes/${pincodeId}/toggle-active`);
  assert.equal(r.data.pincode.is_active, false);
  r = await call("PUT", `/location/pincodes/${pincodeId}`, { json: { pincode: "411036", village_id: villageId } });
  assert.equal(r.data.pincode.is_active, true);
  assert.equal(r.data.pincode.pincode, "411036");

  // deletes + bulk deletes
  r = await call("DELETE", `/location/pincodes/${pincodeId}`);
  assert.equal(r.data.pincode.pincode_id, pincodeId);
  r = await call("DELETE", "/location/pincodes/bulk-delete", { json: { ids: "x" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Invalid pincode IDs");
  r = await call("DELETE", "/location/villages/bulk-delete", { json: { ids: [villageId] } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { success: true, message: "Villages deleted successfully", deletedCount: 1, deletedIds: [villageId] });
  r = await call("DELETE", "/location/cities/bulk-delete", { json: { ids: [9999] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 0);
  r = await call("DELETE", `/location/cities/${cityId}`);
  assert.equal(r.data.city.city_name, "Pimpri");
  r = await call("DELETE", "/location/districts/bulk-delete", { json: { ids: [districtId] } });
  assert.equal(r.data.deletedCount, 1);
  r = await call("DELETE", `/location/states/${goaId}`);
  assert.equal(r.status, 200);
  r = await call("DELETE", "/location/states/bulk-delete", { json: { ids: [stateId] } });
  assert.deepEqual(r.data.deletedIds, [stateId]);
  assert.equal(r.data.message, "States deleted successfully");

  /* ---------- logout + rate limit ---------- */
  r = await call("POST", "/superadmin/logout");
  assert.equal(r.status, 200);
  assert.equal(r.data.message, "Logout successful");
  assert.match(r.res.headers.get("set-cookie"), /super_admin_token=;.*Expires=Thu, 01 Jan 1970/i);
  r = await call("POST", "/superadmin/logout", { auth: false });
  assert.equal(r.status, 401);

  // login limiter: 4 attempts used so far, 5th allowed, 6th blocked
  r = await call("POST", "/superadmin/login", { json: { email: "root@example.test", password: "bad" } });
  assert.equal(r.status, 400);
  r = await call("POST", "/superadmin/login", { json: { email: "root@example.test", password: "bad" } });
  assert.equal(r.status, 429);
  assert.deepEqual(r.data, { success: false, message: "Too many login attempts. Try again later." });

  console.log("super-admin smoke test: PASS");
} catch (err) {
  failed = true;
  console.error("super-admin smoke test: FAIL");
  console.error(err);
} finally {
  server.close();
}

process.exit(failed ? 1 : 0);
