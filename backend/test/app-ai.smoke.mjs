// Smoke test for the app module's AI/weather half.
// Run from backend/:  DB_DRIVER=pglite JWT_SECRET=test node test/app-ai.smoke.mjs
// Postgres parts run on in-memory PGlite; Mongo models and outbound HTTP (Farmonaut/Gemini/company)
// are stubbed, since no Mongo or network is available.
process.env.DB_DRIVER ||= "pglite";
process.env.JWT_SECRET ||= "smoke-secret";
process.env.FARMONAUT_API_KEY ||= "test-key";

import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import jwt from "jsonwebtoken";
import axios from "axios";
import sharp from "sharp";

const { createApp } = await import("../src/app.js");
const { db } = await import("../src/db/connection.js");
const S = await import("../src/db/schema/index.js");
const { env } = await import("../src/config/env.js");

const mod = (p) => import(`../src/${p}`); // path relative to src/
const Crop = (await mod("modules/app/agronomy/crop.mongoModel.js")).default;
const Disease = (await mod("modules/app/cropAi/disease.mongoModel.js")).default;
const Weather = (await mod("modules/app/weather/weather.mongoModel.js")).default;
const Lifecycle = (await mod("modules/app/agronomy/farmCropLifecycle.mongoModel.js")).default;
const FieldIndex = (await mod("modules/app/indexes/fieldIndex.mongoModel.js")).default;
const StressResult = (await mod("modules/app/stress/stressResult.mongoModel.js")).default;
const CropDiagnosis = (await mod("modules/app/cropAi/cropDiagnosis.mongoModel.js")).default;

let failures = 0;
const test = async (name, fn) => {
  try {
    await fn();
    console.log("  ok  ", name);
  } catch (e) {
    failures++;
    console.error("  FAIL", name, "\n      ", e.message);
  }
};

const server = createApp().listen(0);
await new Promise((r) => server.once("listening", r));
const port = server.address().port;

// fetch can't send a body on GET, so use http for that one
const rawRequest = (method, path, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        port,
        path,
        method,
        headers: { "content-type": "application/json", ...(data ? { "content-length": Buffer.byteLength(data) } : {}), ...headers },
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve({ status: res.statusCode, json: buf ? JSON.parse(buf) : null }));
      },
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
const api = (method, path, body, headers) => rawRequest(method, `/api/app${path}`, body, headers);

// ---- seed ----
const [state] = await db.insert(S.states).values({ stateName: "S" }).returning();
const [district] = await db.insert(S.districts).values({ districtName: "D", stateId: state.stateId }).returning();
const [city] = await db.insert(S.cities).values({ cityName: "C", districtId: district.districtId }).returning();
const [village] = await db.insert(S.villages).values({ villageName: "V", cityId: city.cityId }).returning();
const [pin] = await db.insert(S.pincodes).values({ pincode: "411001", villageId: village.villageId }).returning();
const [user] = await db.insert(S.users).values({ phoneNumber: "9999999999", fullName: "T", isVerified: true }).returning();
const [farm] = await db
  .insert(S.farms)
  .values({ userId: user.id, farmName: "F1", fieldId: 123, pincodeId: pin.pincodeId, farmCoordinates: [[73.8, 18.5], [73.9, 18.6]] })
  .returning();
const [farmNoCoords] = await db
  .insert(S.farms)
  .values({ userId: user.id, farmName: "F2", fieldId: 124, pincodeId: pin.pincodeId, farmCoordinates: [] })
  .returning();
const [cat] = await db.insert(S.cropCategories).values({ categoryName: "Cereal" }).returning();
const [st1] = await db.insert(S.cropStages).values({ stageName: "Germination" }).returning();
const [st2] = await db.insert(S.cropStages).values({ stageName: "Tillering" }).returning();
const [crop] = await db
  .insert(S.crops)
  .values({
    categoryId: cat.id,
    cropName: "Wheat",
    tBase: 5,
    cropStageId: [
      { id: st1.id, das_min: 0, das_max: 10, gdd_min: 0, gdd_max: 100 },
      { id: st2.id, das_min: 11, das_max: 30, gdd_min: 101, gdd_max: 400 },
      { id: 9999, das_min: 31, das_max: 40, gdd_min: 401, gdd_max: 500 },
    ],
  })
  .returning();
const token = jwt.sign({ phone_number: "9999999999" }, env.jwtSecret);
const auth = { cookie: `token=${token}` };

console.log("auth guards");
await test("weather/farm requires auth (401)", async () => {
  const r = await api("GET", `/weather/farm/${farm.id}`);
  assert.equal(r.status, 401);
});
await test("weather/get requires auth (401)", async () => {
  assert.equal((await api("POST", "/weather/get", { latitude: 1, longitude: 2 })).status, 401);
});
await test("crop-ai/analyze-crop requires auth (401)", async () => {
  assert.equal((await api("POST", "/crop-ai/analyze-crop", {})).status, 401);
});
await test("weather/store-daily requires auth (401)", async () => {
  assert.equal((await api("POST", "/weather/store-daily", {})).status, 401);
});
await test("invalid token -> 401", async () => {
  const r = await api("GET", `/weather/farm/${farm.id}`, null, { cookie: "token=bad" });
  assert.equal(r.status, 401);
});

console.log("weather (Postgres + stubbed Farmonaut)");
const posts = [];
const origPost = axios.post;
axios.post = async (url, body, cfg) => {
  posts.push({ url, body, cfg });
  if (url.includes("getAllIndexValues")) {
    return { data: { ndvi: { 20240101: 0.5 }, ndre: {}, evi: {}, savi: {}, ndmi: {}, ndwi: {}, rsm: {}, soc: {}, bsi: {}, si: {} } };
  }
  return { data: { daily: [{ temp: { max: 300, min: 290 } }] } };
};
await test("GET public/farm/:id happy path (snake_case farm, key from env)", async () => {
  const r = await api("GET", `/weather/public/farm/${farm.id}`);
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.success, true);
  assert.equal(r.json.farm.farm_name, "F1");
  assert.equal(r.json.farm.pincode, "411001");
  assert.equal(r.json.farm.village_name, "V");
  assert.ok(r.json.weather.daily);
  const last = posts.at(-1);
  assert.equal(last.body.Latitude, "18.5");
  assert.equal(last.body.Longitude, "73.8");
  assert.equal(last.cfg.headers.Authorization, `Bearer ${env.farmonautApiKey}`);
});
await test("GET weather/farm/:id with auth -> 200", async () => {
  assert.equal((await api("GET", `/weather/farm/${farm.id}`, null, auth)).status, 200);
});
await test("GET weather/farm/:id unknown farm -> 404", async () => {
  const r = await api("GET", "/weather/public/farm/999999");
  assert.equal(r.status, 404);
  assert.equal(r.json.message, "Farm not found");
});
await test("GET weather farm with no coordinates -> 400", async () => {
  const r = await api("GET", `/weather/public/farm/${farmNoCoords.id}`);
  assert.equal(r.status, 400);
});
await test("POST weather/public/get validates input (400)", async () => {
  assert.equal((await api("POST", "/weather/public/get", {})).status, 400);
});
await test("POST weather/public/get fetches then caches", async () => {
  const body = { latitude: 18.5, longitude: 73.8, field_id: "f" };
  const a = await api("POST", "/weather/public/get", body);
  assert.equal(a.status, 200);
  assert.equal(a.json.cached, false);
  assert.equal(typeof a.json.weather, "string"); // old API returns stringified JSON
  const b = await api("POST", "/weather/public/get", body);
  assert.equal(b.json.cached, true);
});
await test("store-daily validates user_id / payload (400, Mongo untouched)", async () => {
  assert.equal((await api("POST", "/weather/public/store-daily", { user_id: 5 })).status, 400);
  assert.equal((await api("POST", "/weather/public/store-daily", { user_id: "5", farmsWithWeather: "x" })).status, 400);
});

console.log("indexes (stubbed Farmonaut + FieldIndex)");
FieldIndex.findOneAndUpdate = async (q, u) => u;
await test("POST /indexes/:fieldId maps + stores", async () => {
  const r = await api("POST", "/indexes/abc123", {});
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.fieldId, "abc123");
  assert.deepEqual(r.json.indices.NDVI, { 20240101: 0.5 });
});
const { getFieldIndices } = await mod("modules/app/indexes/indexes.controller.js");
await test("getFieldIndices exported + works", async () => {
  let out;
  await getFieldIndices({ params: { fieldId: "x" } }, { status: (c) => ({ json: (j) => (out = { c, j }) }) });
  assert.equal(out.c, 200);
  assert.equal(out.j.fieldId, "x");
});
axios.post = origPost;

console.log("stress");
await test("invalid fieldId -> 400", async () => {
  const r = await api("GET", "/stress/not-an-objectid/2024-01-01");
  assert.equal(r.status, 400);
  assert.equal(r.json.message, "Invalid fieldId format");
});
await test("stress calc with stubbed models", async () => {
  const oid = "507f1f77bcf86cd799439011";
  const series = (v) => ({ 20240105: v, 20240110: v });
  FieldIndex.findOne = async () => ({
    indices: {
      NDVI: series(60), NDRE: series(60), EVI: series(60), SAVI: series(60), NDMI: series(60),
      NDWI: series(60), RSM: series(60), SOC: series(60), BSI: series(60), SI: series(60),
    },
  });
  StressResult.create = async (d) => d;
  const r = await api("GET", `/stress/${oid}/2024-01-01`);
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.data.final_stress_percent, Math.round((40 + (40 + 40 + 60) / 3 + (40 + 60 + 60) / 3) / 3));
  FieldIndex.findOne = async () => null;
  assert.equal((await api("GET", `/stress/${oid}/2024-01-01`)).status, 404);
});

console.log("CLSM + crop-advisory");
await test("CLSM/infer missing inputs -> 400", async () => {
  const r = await api("POST", "/CLSM/infer", {});
  assert.equal(r.status, 400);
  assert.equal(r.json.error, "Missing required inputs");
});
await test("CLSM/infer full flow with stubbed Mongo models", async () => {
  Crop.findOne = async () => ({
    _id: "c1",
    crop: "wheat",
    base_temperature_c: 5,
    growth_stages: [
      { stage: "Germination", das_min: 0, das_max: 10, gdd_min: 0, gdd_max: 100 },
      { stage: "Tillering", das_min: 11, das_max: 30, gdd_min: 101, gdd_max: 400 },
    ],
  });
  Disease.findOne = async () => ({
    disease_risk: [{ stage: "Germination", das_min: 0, das_max: 20, gdd_min: 0, gdd_max: 500, disease_name: "Rust" }],
  });
  const docs = Array.from({ length: 5 }, (_, i) => ({
    created_at: `2024-01-0${i + 1}`,
    farmsWithWeather: [{ id: 7, weather: { daily: [{ temp: { max: 303.15, min: 293.15 } }] } }],
  }));
  Weather.find = () => ({ sort: async () => docs });
  Lifecycle.findOneAndUpdate = async (q, u) => u.$set;
  const r = await api("POST", "/CLSM/infer", {
    user_id: 1, farm_id: 7, field_id: 3, crop_name: "wheat", sowing_date: "2024-01-01", current_date: "2024-01-06",
  });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.data.clcm_status.das, 5);
  assert.equal(r.json.data.clcm_status.cumulative_gdd, 100); // 5 days * (avg 25 - base 5)
  assert.equal(r.json.data.current_stage, "Germination");
  assert.equal(r.json.data.clcm_status.disease_risk, "HIGH");
});
await test("CLSM/get-all-crops", async () => {
  Crop.find = () => ({ lean: async () => [{ crop: "wheat" }] });
  const r = await api("GET", "/CLSM/get-all-crops");
  assert.equal(r.status, 200);
  assert.equal(r.json.count, 1);
});
await test("crop-advisory returns crop + stages from Postgres (Drizzle port)", async () => {
  const r = await rawRequest("GET", "/api/app/crop-advisory", { farm_id: farm.id, crop_id: crop.id });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.crop_name, "Wheat");
  assert.equal(r.json.t_base, 5);
  assert.equal(r.json.category_name, "Cereal");
  assert.equal(r.json.category_id, cat.id);
  assert.equal(r.json.crop_stages.length, 3);
  assert.deepEqual(r.json.crop_stages[0], { id: st1.id, stage_name: "Germination", das_min: 0, das_max: 10, gdd_min: 0, gdd_max: 100 });
  assert.equal(r.json.crop_stages[2].stage_name, null);
});
await test("crop-advisory unknown crop -> null", async () => {
  const r = await rawRequest("GET", "/api/app/crop-advisory", { crop_id: 99999 });
  assert.equal(r.status, 200);
  assert.equal(r.json, null);
});
await test("getFarmCrop (Drizzle)", async () => {
  await db.insert(S.farmCrops).values({ farmId: farm.id, cropId: crop.id, sowingDate: "2024-01-01" });
  const { getFarmCrop } = await mod("modules/app/agronomy/crop.service.js");
  const fc = await getFarmCrop(farm.id, crop.id);
  assert.equal(fc.crop_name, "Wheat");
  assert.equal(fc.sowing_date, "2024-01-01");
  assert.equal(fc.farm_id, farm.id);
  assert.equal(await getFarmCrop(farm.id, 424242), null);
});

console.log("uploads / images / crop-ai");
await test("whatsapp analyze-crop multipart without image -> 400 JSON", async () => {
  const fd = new FormData();
  fd.append("body", JSON.stringify({ language: "en" }));
  const res = await fetch(`http://localhost:${port}/api/app/whatsapp/analyze-crop`, { method: "POST", body: fd });
  const j = await res.json();
  assert.equal(res.status, 400);
  assert.equal(j.status, "error");
});
const jpeg = await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 10, g: 150, b: 20 } } }).jpeg().toBuffer();
await test("crop-ai analyze-crop multipart without image -> 400 'No image uploaded'", async () => {
  const fd = new FormData();
  fd.append("body", JSON.stringify({ language: "en" }));
  const res = await fetch(`http://localhost:${port}/api/app/crop-ai/analyze-crop`, { method: "POST", body: fd, headers: auth });
  const j = await res.json();
  assert.equal(res.status, 400);
  assert.equal(j.message, "No image uploaded");
});
await test("normalizeImage + getImageHash + fileToGenerativePart", async () => {
  const { normalizeImage } = await mod("utils/app/normalizeImage.js");
  const { getImageHash } = await mod("utils/app/getImageHash.js");
  const { fileToGenerativePart } = await mod("utils/app/fileHelper.js");
  const n = await normalizeImage(jpeg);
  assert.ok(n.length > 0);
  assert.equal(getImageHash(n).length, 64);
  assert.equal(fileToGenerativePart(n, "image/jpeg").inlineData.mimeType, "image/jpeg");
});
await test("uploadImageToS3 stores via utils/storage (local fallback)", async () => {
  const up = (await mod("modules/app/cropAi/cropImage.service.js")).default;
  const url = await up({ buffer: jpeg, imageHash: "smokehash" });
  assert.match(url, /\/uploads\/crop_ai\/smokehash-\d+\.jpg$/);
  const file = url.split("/uploads/")[1];
  assert.ok(fs.existsSync(`uploads/${file}`));
  fs.unlinkSync(`uploads/${file}`);
});
await test("analyzeCrop cached path (stubbed CropDiagnosis, real company recommendations)", async () => {
  // company catalogue row that targets the seeded "Wheat" crop + "Rust" disease
  const [ctype] = await db.insert(S.companyTypes).values({ type: "Agro" }).returning();
  const [co] = await db
    .insert(S.companies)
    .values({ companyType: ctype.id, name: "Co", address: "A", gstNo: "G1", email: "co@x.dev", phone: "1" })
    .returning();
  const [brand] = await db.insert(S.companyBrands).values({ companyId: co.id, brandName: "B" }).returning();
  const [pcat] = await db.insert(S.companyCategories).values({ companyId: co.id, brandId: brand.id, categoryName: "F" }).returning();
  const [psub] = await db
    .insert(S.companySubCategories)
    .values({ companyId: co.id, brandId: brand.id, categoryId: pcat.id, subCategoryName: "S" })
    .returning();
  const wheat = (await db.select().from(S.crops)).find((c) => /wheat/i.test(c.cropName));
  assert.ok(wheat, "seeded Wheat crop expected");
  await db.insert(S.companyProducts).values({
    companyId: co.id, brandId: brand.id, categoryId: pcat.id, subCategoryId: psub.id,
    productName: "RustGuard", chemicalComposition: { a: "b" }, cropIds: [wheat.id], diseaseNames: ["Rust"],
  });

  CropDiagnosis.findOne = async () => ({
    imageUrl: "http://img",
    diagnosisData: { cropIdentification: { cropName: "Wheat" }, diagnosis: { primaryIssue: { name: "Rust" } } },
  });
  const analyzeCrop = (await mod("modules/app/cropAi/cropAi.controller.js")).default;
  let out;
  const res = { status: (c) => ((out = { c }), res), json: (j) => ((out = { ...out, j }), res) };
  await analyzeCrop({ user: { id: 1 }, body: {}, imageBuffer: jpeg }, res);
  assert.equal(out.j.status, "success");
  assert.equal(out.j.cached, true);
  assert.equal(out.j.productRecommendations.count, 1);
  assert.equal(out.j.productRecommendations.products[0].product_name, "RustGuard");
  assert.equal(out.j.productRecommendations.products[0].match_type, "disease");
});

console.log("agronomy pure logic");
await test("gdd / stage transition / disease risk", async () => {
  const a = await mod("modules/app/agronomy/index.js");
  assert.equal(a.calculateDAS("2024-01-01", "2024-01-11"), 10);
  assert.equal(a.calculateCumulativeGDD([{ avg_temperature: 20 }, { avg_temperature: 3 }], 5), 15);
  const stages = [
    { stage: "A", das_min: 0, das_max: 10, gdd_min: 0, gdd_max: 100 },
    { stage: "B", das_min: 11, das_max: 30, gdd_min: 101, gdd_max: 400 },
  ];
  const s = a.determineStageWithTransition(stages, 12, 90);
  assert.equal(s.dominantStage.stage, "A");
  assert.equal(s.nextStage.stage, "B");
  assert.equal(a.estimateDaysToNextStage([{ avg_temperature: 25 }], 5, 50, stages[1]), "3 days");
  assert.equal(a.evaluateDiseaseRisk(null, null, 1, 1).disease_risk, "LOW");
});

console.log("init / cron");
await test("startSchedulers exported, weather cron scheduler loads", async () => {
  const jobs = await mod("jobs/index.js");
  assert.equal(typeof jobs.startSchedulers, "function");
  const cron = await mod("jobs/schedulers/weatherCron.scheduler.js");
  assert.equal(typeof cron.startWeatherCron, "function");
});

server.close();
console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
