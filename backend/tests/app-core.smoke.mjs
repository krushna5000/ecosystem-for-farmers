// Smoke test for the farmer-app CORE module (auth, farms, whatsapp-auth/farm).
// Run from backend/:  node tests/app-core.smoke.mjs
process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET = process.env.JWT_SECRET || "smoke-test-secret";
process.env.FARMONAUT_API_KEY = "test-key";

import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import { eq } from "drizzle-orm";

// Stub the Farmonaut cloud functions (no network in tests)
let nextFieldId = 9001;
const farmonautCalls = [];
axios.post = async (url, body) => {
  farmonautCalls.push({ method: "post", url, body });
  return { data: { FieldID: nextFieldId++ } };
};
axios.delete = async (url, cfg) => {
  farmonautCalls.push({ method: "delete", url, data: cfg?.data });
  return { data: {} };
};

const { db } = await import("../src/db/index.js");
const s = await import("../src/db/schema/index.js");
const { default: coreRoutes } = await import("../src/modules/app/routes/core.routes.js");
const farmModel = await import("../src/modules/app/models/farmModel.js");

// ---- seed ----
const [st] = await db.insert(s.states).values({ stateName: "Maharashtra" }).returning();
const [di] = await db.insert(s.districts).values({ districtName: "Pune", stateId: st.stateId }).returning();
const [ci] = await db.insert(s.cities).values({ cityName: "Haveli", districtId: di.districtId }).returning();
const [vi] = await db.insert(s.villages).values({ villageName: "Hadapsar", cityId: ci.cityId }).returning();
const [pin] = await db.insert(s.pincodes).values({ pincode: "411028", villageId: vi.villageId }).returning();
const [cat] = await db.insert(s.cropCategories).values({ categoryName: "Cereal" }).returning();
const [stg1] = await db.insert(s.cropStages).values({ stageName: "Germination" }).returning();
const [stg2] = await db.insert(s.cropStages).values({ stageName: "Tillering" }).returning();
const [crop] = await db
  .insert(s.crops)
  .values({
    categoryId: cat.id,
    cropName: "Wheat",
    tBase: 5,
    cropStageId: [
      { id: stg1.id, days: "10", weeks: "1" },
      { id: stg2.id, days: "30", weeks: "4" },
    ],
  })
  .returning();
await db.insert(s.crops).values({ categoryId: cat.id, cropName: "Rice", tBase: 10 });

// ---- app ----
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/app", coreRoutes);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/app`;

const call = async (method, path, { body, headers = {}, cookie } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
};

let failed = false;
const step = async (name, fn) => {
  try {
    await fn();
    console.log("PASS", name);
  } catch (e) {
    failed = true;
    console.error("FAIL", name, "\n", e);
  }
};

const phone = "9876543210";
let token, userId, cookie, farmId, farmCropId, otp;

await step("register send-otp validation", async () => {
  let r = await call("POST", "/auth/register/send-otp", { body: { phone_number: phone } });
  assert.equal(r.status, 400);
  r = await call("POST", "/auth/register/send-otp", { body: { phone_number: "123", full_name: "Ram" } });
  assert.equal(r.status, 400);
  assert.equal(r.json.message, "Please provide a valid mobile number.");
  r = await call("POST", "/auth/register/send-otp", { body: { phone_number: phone, full_name: "Ram 1" } });
  assert.equal(r.status, 400);
});

await step("register send-otp -> 201 with otp; duplicate -> 409", async () => {
  let r = await call("POST", "/auth/register/send-otp", {
    body: { phone_number: phone, full_name: "Ram Patil" },
    headers: { "x-user-type": "webapp" },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.success, true);
  assert.match(r.json.otp, /^\d{6}$/);
  otp = r.json.otp;
  const [u] = await db.select().from(s.users);
  assert.equal(u.userType, "webapp");
  r = await call("POST", "/auth/register/send-otp", { body: { phone_number: phone, full_name: "Ram Patil" } });
  assert.equal(r.status, 409);
});

await step("register verify-otp: bad -> 401, good -> 200 + cookie + token + snake user", async () => {
  let r = await call("POST", "/auth/register/verify-otp", { body: { phone_number: phone, otp: "000000" } });
  assert.equal(r.status, 401);
  r = await call("POST", "/auth/register/verify-otp", { body: { phone_number: phone, otp } });
  assert.equal(r.status, 200);
  assert.ok(r.json.token);
  assert.ok(r.setCookie.startsWith("token="));
  assert.ok("phone_number" in r.json.user && "full_name" in r.json.user && "is_verified" in r.json.user);
  assert.ok(!("phoneNumber" in r.json.user));
  token = r.json.token;
  userId = r.json.user.id;
  cookie = `token=${token}`;
  // otp is single-use
  r = await call("POST", "/auth/register/verify-otp", { body: { phone_number: phone, otp } });
  assert.equal(r.status, 401);
});

await step("login send/verify otp", async () => {
  let r = await call("POST", "/auth/login/send-otp", { body: { phone_number: "9111111111" } });
  assert.equal(r.status, 400);
  assert.equal(r.json.message, "User not found, please register first");
  r = await call("POST", "/auth/login/send-otp", { body: { phone_number: phone } });
  assert.equal(r.status, 200);
  r = await call("POST", "/auth/login/verify-otp", { body: { phone_number: phone, otp: r.json.otp } });
  assert.equal(r.status, 200);
  assert.equal(r.json.message, "Login successful");
  assert.equal(r.json.user.is_verified, true);
});

await step("authMiddleware: none/bad -> 401, cookie / Bearer / raw header ok", async () => {
  let r = await call("GET", "/auth/profile");
  assert.equal(r.status, 401);
  assert.equal(r.json.message, "No token provided");
  r = await call("GET", "/auth/profile", { headers: { authorization: "Bearer junk" } });
  assert.equal(r.status, 401);
  assert.equal(r.json.message, "Invalid token");
  r = await call("GET", "/auth/profile", { cookie });
  assert.equal(r.status, 200);
  r = await call("GET", "/auth/profile", { headers: { authorization: `Bearer ${token}` } });
  assert.equal(r.status, 200);
  r = await call("GET", "/auth/profile", { headers: { authorization: token } });
  assert.equal(r.status, 200);
});

await step("verify-auth + logout", async () => {
  let r = await call("GET", "/auth/verify-auth", { cookie });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.json.user).sort(), ["full_name", "id", "is_verified", "phone_number"]);
  r = await call("POST", "/auth/logout");
  assert.equal(r.status, 200);
  assert.equal(r.json.message, "Logged out successfully");
});

await step("update profile", async () => {
  let r = await call("PUT", "/auth/profile", { cookie, body: { phone_number: "1" } });
  assert.equal(r.status, 400);
  r = await call("PUT", "/auth/profile", { cookie, body: { language: "French" } });
  assert.equal(r.status, 400);
  r = await call("PUT", "/auth/profile", { cookie, body: { language: "Marathi" } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json.user, { id: userId, full_name: "Ram Patil", language: "Marathi" });
  r = await call("PUT", "/auth/profile", { cookie, body: { full_name: "Ram Kumar" } });
  assert.equal(r.json.user.full_name, "Ram Kumar");
  assert.equal(r.json.user.language, "Marathi");
});

await step("get-all-pincodes / get-all-crops (jsonb lateral)", async () => {
  let r = await call("GET", "/farms/get-all-pincodes", { cookie });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json.pincodes, [{ pincode_id: pin.pincodeId, pincode: "411028" }]);
  r = await call("GET", "/farms/get-all-crops", { cookie });
  assert.equal(r.status, 200);
  const wheat = r.json.data.find((c) => c.crop_name === "Wheat");
  assert.equal(wheat.category_name, "Cereal");
  assert.equal(wheat.crop_stages.length, 2);
  assert.deepEqual(wheat.crop_stages[0], { stage_id: stg1.id, stage_name: "Germination", days: "10", weeks: "1" });
  const rice = r.json.data.find((c) => c.crop_name === "Rice");
  assert.deepEqual(rice.crop_stages, []);
});

const coords = [
  [73.9, 18.5],
  [73.91, 18.5],
  [73.91, 18.51],
];
await step("farms CRUD", async () => {
  let r = await call("POST", "/farms/add-farm", { cookie, body: { user_id: userId, farm_name: "F1" } });
  assert.equal(r.status, 400);
  r = await call("POST", "/farms/add-farm", {
    cookie,
    body: { user_id: userId, farm_name: "F1", pincode_id: pin.pincodeId, farm_coordinates: [[1, 2]] },
  });
  assert.equal(r.status, 400);
  r = await call("POST", "/farms/add-farm", {
    cookie,
    body: { user_id: userId, farm_name: "F1", pincode_id: pin.pincodeId, farm_coordinates: coords },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.farm_name, "F1");
  assert.equal(r.json.data.field_id, 9001);
  assert.deepEqual(r.json.data.farm_coordinates, coords);
  assert.ok("user_id" in r.json.data && "pincode_id" in r.json.data);
  farmId = r.json.data.id;

  r = await call("GET", `/farms/get-farms/${userId}`, { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.length, 1);
  const f = r.json.data[0];
  for (const k of ["id", "user_id", "farm_name", "field_id", "pincode_id", "farm_coordinates", "created_at", "pincode", "village_name", "city_name", "district_name", "state_name"])
    assert.ok(k in f, `missing ${k}`);
  assert.equal(f.state_name, "Maharashtra");

  r = await call("GET", `/farms/get-farm/${farmId}`, { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.village_name, "Hadapsar");
  r = await call("GET", "/farms/get-farm/99999", { cookie });
  assert.equal(r.status, 404);

  r = await call("PUT", `/farms/update-farm/${farmId}`, { cookie, body: { farm_name: "F1b" } });
  assert.equal(r.status, 200);
  assert.equal(r.json.data.farm_name, "F1b");
  assert.deepEqual(r.json.data.farm_coordinates, coords);
  r = await call("PUT", "/farms/update-farm/99999", { cookie, body: { farm_name: "x" } });
  assert.equal(r.status, 404);
});

await step("farm crops CRUD (future sowing date, no weather call)", async () => {
  let r = await call("POST", "/farms/add-farm-crop", { cookie, body: { farm_id: farmId, crop_id: crop.id } });
  assert.equal(r.status, 400);
  r = await call("POST", "/farms/add-farm-crop", {
    cookie,
    body: { farm_id: farmId, crop_id: crop.id, sowing_date: "01-02-2030" },
  });
  assert.equal(r.status, 400);
  r = await call("POST", "/farms/add-farm-crop", {
    cookie,
    body: { farm_id: farmId, crop_id: crop.id, sowing_date: "2099-01-02" },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.weatherStored, false);
  assert.equal(r.json.data.sowing_date, "2099-01-02");
  farmCropId = r.json.data.id;
  assert.ok("farm_id" in r.json.data && "crop_id" in r.json.data && "current_stage" in r.json.data);

  r = await call("GET", `/farms/get-farm-crops/${farmId}`, { cookie });
  assert.equal(r.json.data[0].crop_name, "Wheat");
  r = await call("GET", `/farms/get-farm-crops-by-user/${userId}`, { cookie });
  assert.deepEqual(Object.keys(r.json.data[0]).sort(), ["crop_id", "crop_name", "farm_crop_id", "farm_id", "farm_name", "sowing_date"]);
  r = await call("GET", `/farms/get-farm-crop/${farmCropId}`, { cookie });
  assert.equal(r.json.data.crop_name, "Wheat");
  r = await call("GET", "/farms/get-farm-crop/99999", { cookie });
  assert.equal(r.status, 404);
  r = await call("PUT", `/farms/update-farm-crop/${farmCropId}`, { cookie, body: { sowing_date: "2099-02-03" } });
  assert.equal(r.json.data.sowing_date, "2099-02-03");
  r = await call("PUT", `/farms/update-farm-crop/${farmCropId}`, { cookie, body: {} });
  assert.equal(r.json.data.sowing_date, "2099-02-03");

  r = await call("GET", "/auth/profile", { cookie });
  assert.equal(r.json.profile.total_farms, 1);
  assert.equal(r.json.profile.total_crops, 1);
  assert.equal(r.json.profile.location_area[0].village, "Hadapsar");
  assert.equal(r.json.profile.crops[0].crop_name, "Wheat");
  assert.equal(r.json.profile.user.language, "Marathi");

  r = await call("DELETE", `/farms/delete-farm-crop/${farmCropId}`, { cookie });
  assert.equal(r.status, 200);
  r = await call("DELETE", `/farms/delete-farm-crop/${farmCropId}`, { cookie });
  assert.equal(r.status, 404);
});

await step("indices route is mounted (resolves past validateFieldRequest)", async () => {
  const r = await call("GET", "/farms/indices/9001");
  assert.notEqual(r.status, 404);
  assert.notEqual(r.status, 400);
});

await step("delete farm -> Farmonaut delete + local delete", async () => {
  let r = await call("DELETE", `/farms/delete-farm/${farmId}`, { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.json.message, "Farm deleted successfully");
  assert.ok(farmonautCalls.some((c) => c.method === "delete" && c.data.FieldID === 9001));
  r = await call("DELETE", `/farms/delete-farm/${farmId}`, { cookie });
  assert.equal(r.status, 404);
});

await step("model: addFarm(string coords) / getAllFarms / updateFarmFieldId", async () => {
  const f = await farmModel.addFarm(userId, "F2", pin.pincodeId, JSON.stringify(coords), 5);
  assert.equal(typeof f.field_id, "number");
  const upd = await farmModel.updateFarmFieldId(f.id, 77);
  assert.equal(upd.field_id, 77);
  const all = await farmModel.getAllFarms();
  assert.equal(all.length, 1);
  assert.equal(all[0].field_id, 77);
  assert.ok(Array.isArray(all[0].farm_coordinates));
  await farmModel.deleteFarm(f.id);
});

await step("whatsapp auth: check-user / register", async () => {
  const wa = "919123456789";
  let r = await call("POST", "/whatsapp-auth/check-user", { body: {} });
  assert.equal(r.status, 400);
  r = await call("POST", "/whatsapp-auth/check-user", { body: { phone_number: wa } });
  assert.equal(r.status, 200);
  assert.equal(r.json.registered, false);
  const waOtp = r.json.otp;
  r = await call("POST", "/whatsapp-auth/register", { body: { phone_number: wa, otp: "111111" } });
  assert.equal(r.status, 401);
  r = await call("POST", "/whatsapp-auth/register", { body: { phone_number: wa, otp: waOtp, full_name: "WA Farmer" } });
  assert.equal(r.status, 201);
  assert.equal(r.json.user.phone_number, "9123456789");
  const [u] = await db.select().from(s.users).where(eq(s.users.phoneNumber, "9123456789"));
  assert.equal(u.userType, "whatsapp");
  assert.equal(u.isVerified, true);
  r = await call("POST", "/whatsapp-auth/check-user", { body: { phone_number: "+91 9123456789" } });
  assert.equal(r.json.registered, true);
  assert.equal(r.json.user.full_name, "WA Farmer");
});

await step("whatsapp farm: add-farm", async () => {
  let r = await call("POST", "/whatsapp-farm/add-farm", { body: { phone_number: "9123456789" } });
  assert.equal(r.status, 400);
  const ok = { phone_number: "9123456789", farm_name: "WA Farm", pincode: "411028", area_acres: "2", lat: "18.5", lng: "73.9" };
  r = await call("POST", "/whatsapp-farm/add-farm", { body: { ...ok, pincode: "000000" } });
  assert.equal(r.status, 400);
  assert.match(r.json.message, /Invalid pincode/);
  r = await call("POST", "/whatsapp-farm/add-farm", { body: { ...ok, area_acres: "50" } });
  assert.equal(r.status, 400);
  assert.match(r.json.message, /cannot exceed 10 hectares/);
  r = await call("POST", "/whatsapp-farm/add-farm", { body: { ...ok, phone_number: "9000000000" } });
  assert.equal(r.json.message, "User not found");
  r = await call("POST", "/whatsapp-farm/add-farm", { body: ok });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.farm_name, "WA Farm");
  assert.equal(typeof r.json.data.farm_id, "number");
  assert.ok(r.json.data.field_id >= 9001);
});

server.close();
if (failed) {
  console.error("SMOKE TEST FAILED");
  process.exit(1);
}
console.log("SMOKE TEST PASSED");
process.exit(0);
