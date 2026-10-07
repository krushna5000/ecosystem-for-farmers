// Prototype module (GDD + map) through the real app.   node test/prototypes.smoke.mjs
process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "test-secret";
import assert from "node:assert/strict";
const { createApp } = await import("../src/app.js");
const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}/api/prototypes`;
const post = async (path, body) => {
  const r = await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json() };
};
try {
  let r = await post("/map/farm", { coordinates: [{ lat: 1, lon: 2 }], area_hectares: 1 });
  assert.equal(r.status, 400);
  r = await post("/map/farm", { coordinates: [{ lat: 1, lon: 2 }, { lat: 2, lon: 2 }, { lat: "x", lon: 1 }], area_hectares: 1 });
  assert.equal(r.data.message, "Each coordinate must have numeric lat and lon");
  r = await post("/map/farm", { coordinates: [{ lat: 1, lon: 2 }, { lat: 2, lon: 2 }, { lat: 3, lon: 1 }], area_hectares: 0 });
  assert.equal(r.data.message, "Invalid area");
  r = await post("/map/farm", { coordinates: [{ lat: 1, lon: 2 }, { lat: 2, lon: 2 }, { lat: 3, lon: 1 }], area_hectares: 2.5 });
  assert.equal(r.status, 200);
  assert.equal(r.data.success, true);
  r = await post("/gdd/transform", { cropName: "Wheat" });
  assert.equal(r.status, 400);
  assert.equal(r.data.error, "Latitude and Longitude are required");
  console.log("prototypes smoke test: PASS");
  server.close(); process.exit(0);
} catch (e) { console.error("prototypes smoke test: FAIL", e); server.close(); process.exit(1); }
