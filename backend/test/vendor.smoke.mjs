// Vendor portal smoke test (in-memory Postgres).
// Run from backend/:  DB_DRIVER=pglite node test/vendor.smoke.mjs
import assert from "node:assert/strict";

process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "smoke-jwt-secret";
process.env.REFRESH_SECRET ||= "smoke-refresh-secret";
process.env.USE_CONSOLE_EMAIL = "true";

const { default: express } = await import("express");
const { default: cookieParser } = await import("cookie-parser");
const { default: bcrypt } = await import("bcryptjs");
const { default: jwt } = await import("jsonwebtoken");
const { eq } = await import("drizzle-orm");
const { db } = await import("../src/db/connection.js");
const s = await import("../src/db/schema/index.js");
const { default: vendorRouter } = await import("../src/modules/vendor/index.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/vendor-portal", vendorRouter);
// same shape as app.js error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ success: false, message: err.message });
});

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/vendor-portal`;

class Client {
  constructor() {
    this.cookies = {};
  }
  async call(method, path, { json, form, headers = {} } = {}) {
    const h = { ...headers };
    const cookie = Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
    if (cookie) h.cookie = cookie;
    let body;
    if (json !== undefined) {
      h["content-type"] = "application/json";
      body = JSON.stringify(json);
    } else if (form) {
      body = form;
    }
    const res = await fetch(base + path, { method, headers: h, body });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i);
      const val = pair.slice(i + 1);
      if (val === "" || /expires=thu, 01 jan 1970/i.test(c)) delete this.cookies[name];
      else this.cookies[name] = val;
    }
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data, headers: res.headers };
  }
}

const png = () => new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" });
const fd = (fields, file) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.append(k, v);
  if (file) f.append(file.name, png(), "x.png");
  return f;
};
const isSnake = (obj) => Object.keys(obj).every((k) => k === k.toLowerCase());

let passed = 0;
const step = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    console.error(`FAIL  ${name}\n`, e);
    process.exitCode = 1;
    server.close();
    process.exit(1);
  }
};

// ---------- seed ----------
const hash = await bcrypt.hash("Passw0rd!", 10);
const [vA] = await db
  .insert(s.vendors)
  .values({ name: "Vendor A", email: "a@v.test", phone: "1111111111", password: hash, isApprove: true })
  .returning();
const [vB] = await db
  .insert(s.vendors)
  .values({ name: "Vendor B", email: "b@v.test", phone: "2222222222", password: hash, isApprove: true })
  .returning();
const [cat] = await db.insert(s.cropCategories).values({ categoryName: "Cereal" }).returning();
await db.insert(s.crops).values([
  { categoryId: cat.id, cropName: "Wheat", tBase: 5 },
  { categoryId: cat.id, cropName: "Rice", tBase: 10 },
]);

const A = new Client();
const B = new Client();

// ---------- auth ----------
await step("check-auth without token -> 401", async () => {
  const r = await A.call("GET", "/vendor/check-auth");
  assert.equal(r.status, 401);
  assert.equal(r.data.message, "Unauthorized");
});
await step("login validation / wrong password / unknown email", async () => {
  assert.equal((await A.call("POST", "/vendor/login", { json: {} })).status, 400);
  const bad = await A.call("POST", "/vendor/login", { json: { email: "a@v.test", password: "nope" } });
  assert.equal(bad.status, 401);
  assert.equal(bad.data.message, "Invalid email or password");
  assert.equal((await A.call("POST", "/vendor/login", { json: { email: "x@v.test", password: "x" } })).status, 401);
});
await step("login sets cookies, returns vendor", async () => {
  const r = await A.call("POST", "/vendor/login", { json: { email: "a@v.test", password: "Passw0rd!" } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { success: true, message: "Login successful", vendor: { id: vA.id, name: "Vendor A", email: "a@v.test" } });
  assert.ok(A.cookies.vendor_access_token && A.cookies.vendor_refresh_token);
  const payload = jwt.verify(A.cookies.vendor_access_token, `${process.env.JWT_SECRET}:vendor`);
  assert.equal(payload.role, "vendor");
  assert.equal(payload.exp - payload.iat, 15 * 60);
  const rp = jwt.verify(A.cookies.vendor_refresh_token, process.env.REFRESH_SECRET);
  assert.equal(rp.exp - rp.iat, 7 * 24 * 3600);
});
await step("login vendor B", async () => {
  const r = await B.call("POST", "/vendor/login", { json: { email: "b@v.test", password: "Passw0rd!" } });
  assert.equal(r.status, 200);
});
await step("check-auth with cookie + bearer header", async () => {
  const r = await A.call("GET", "/vendor/check-auth");
  assert.equal(r.status, 200);
  assert.equal(r.data.authenticated, true);
  assert.equal(r.data.user.id, vA.id);
  assert.equal(r.headers.get("cache-control"), "no-store");
  const hdr = new Client();
  const r2 = await hdr.call("GET", "/vendor/check-auth", { headers: { authorization: `Bearer ${A.cookies.vendor_access_token}` } });
  assert.equal(r2.status, 200);
  const r3 = await hdr.call("GET", "/vendor/check-auth", { headers: { authorization: "Bearer garbage" } });
  assert.equal(r3.status, 401);
  assert.equal(r3.data.message, "Invalid or expired token");
});
await step("refresh", async () => {
  const c = new Client();
  assert.equal((await c.call("POST", "/vendor/refresh")).status, 401);
  c.cookies.vendor_refresh_token = "junk";
  assert.equal((await c.call("POST", "/vendor/refresh")).status, 403);
  c.cookies.vendor_refresh_token = A.cookies.vendor_refresh_token;
  const r = await c.call("POST", "/vendor/refresh");
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { success: true });
  assert.ok(c.cookies.vendor_access_token);
});

// ---------- brands ----------
let brandA;
await step("brand create requires name + logo; creates; duplicate 409", async () => {
  assert.equal((await A.call("POST", "/brands", { form: fd({}) })).data.message, "Brand name is required");
  assert.equal((await A.call("POST", "/brands", { form: fd({ brand_name: "Bayer" }) })).data.message, "Brand logo is required");
  const r = await A.call("POST", "/brands", { form: fd({ brand_name: "Bayer", status: "true" }, { name: "logo" }) });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.status, "success");
  brandA = r.data.data;
  assert.ok(isSnake(brandA) && brandA.vendor_id === vA.id && brandA.brand_name === "Bayer" && brandA.status === true);
  assert.match(brandA.logo, /\/uploads\/vendor-brands\/.+\.png$/);
  const dup = await A.call("POST", "/brands", { form: fd({ brand_name: "bAyEr" }, { name: "logo" }) });
  assert.equal(dup.status, 409);
  // same name allowed for other vendor
  assert.equal((await B.call("POST", "/brands", { form: fd({ brand_name: "Bayer" }, { name: "logo" }) })).status, 200);
});
await step("brand non-image rejected", async () => {
  const f = new FormData();
  f.append("brand_name", "Txt");
  f.append("logo", new Blob(["hi"], { type: "text/plain" }), "x.txt");
  const r = await A.call("POST", "/brands", { form: f });
  assert.notEqual(r.status, 200);
  assert.equal(r.data.message, "Only image files are allowed");
});
await step("brand list/get/update/pagination isolation", async () => {
  const l = await A.call("GET", "/brands?page=1&limit=5");
  assert.equal(l.data.data.data.length, 1);
  assert.deepEqual(l.data.data.pagination, { total: 1, page: 1, limit: 5, totalPages: 1 });
  assert.equal((await A.call("GET", `/brands/${brandA.id}`)).data.data.brand_name, "Bayer");
  assert.equal((await A.call("GET", "/brands/abc")).data.message, "Invalid brand ID format");
  assert.equal((await B.call("GET", `/brands/${brandA.id}`)).status, 404);
  assert.equal((await B.call("PUT", `/brands/${brandA.id}`, { form: fd({ brand_name: "Hacked" }) })).status, 404);
  const u = await A.call("PUT", `/brands/${brandA.id}`, { form: fd({ brand_name: "Bayer CropScience", status: "false" }) });
  assert.equal(u.status, 200);
  assert.equal(u.data.data.brand_name, "Bayer CropScience");
  assert.equal(u.data.data.status, false);
  assert.equal(u.data.data.logo, brandA.logo); // COALESCE kept the logo
  const u2 = await A.call("PUT", `/brands/${brandA.id}`, { form: fd({ status: "true" }, { name: "logo" }) });
  assert.notEqual(u2.data.data.logo, brandA.logo);
  assert.equal(u2.data.data.brand_name, "Bayer CropScience");
});

// ---------- categories ----------
let catA;
await step("category CRUD + toggle", async () => {
  assert.equal((await A.call("POST", "/categories", { json: {} })).status, 400);
  const foreign = await B.call("POST", "/categories", { json: { brand_id: brandA.id, category_name: "X" } });
  assert.equal(foreign.status, 400);
  assert.equal(foreign.data.message, "Invalid brand_id or brand does not belong to this vendor");
  const c = await A.call("POST", "/categories", { json: { brand_id: brandA.id, category_name: " Fungicide " } });
  assert.equal(c.status, 201);
  catA = c.data.category;
  assert.ok(isSnake(catA) && catA.category_name === "Fungicide" && catA.brand_id === brandA.id);
  assert.equal((await A.call("POST", "/categories", { json: { brand_id: brandA.id, category_name: "fungicide" } })).status, 409);
  const l = await A.call("GET", "/categories");
  assert.equal(l.data.data.categories.length, 1);
  assert.equal(l.data.data.pagination.totalPages, 1);
  assert.equal((await A.call("GET", `/categories/${catA.id}`)).data.category.id, catA.id);
  assert.equal((await B.call("GET", `/categories/${catA.id}`)).status, 404);
  const u = await A.call("PUT", `/categories/${catA.id}`, { json: { brand_id: brandA.id, category_name: "Fungicides" } });
  assert.equal(u.status, 200);
  assert.equal(u.data.data.category_name, "Fungicides");
  assert.equal((await A.call("PUT", "/categories/abc", { json: { brand_id: 1, category_name: "x" } })).status, 400);
  const t = await A.call("PATCH", `/categories/status/${catA.id}`);
  assert.equal(t.data.message, "Category status updated successfully");
  assert.equal((await A.call("GET", `/categories/${catA.id}`)).data.category.status, false);
  assert.equal((await B.call("PATCH", `/categories/status/${catA.id}`)).status, 404);
});

// ---------- sub-categories ----------
let subA;
await step("sub-category CRUD + toggle", async () => {
  assert.equal((await A.call("POST", "/subcategories", { json: {} })).status, 400);
  assert.equal(
    (await B.call("POST", "/subcategories", { json: { brand_id: brandA.id, category_id: catA.id, sub_category_name: "S" } })).data.message,
    "Invalid brand_id for this vendor",
  );
  const c = await A.call("POST", "/subcategories", { json: { brand_id: brandA.id, category_id: catA.id, sub_category_name: "Systemic" } });
  assert.equal(c.status, 200, JSON.stringify(c.data));
  subA = c.data.data;
  assert.ok(isSnake(subA) && subA.sub_category_name === "Systemic");
  assert.equal((await A.call("POST", "/subcategories", { json: { brand_id: brandA.id, category_id: catA.id, sub_category_name: "SYSTEMIC" } })).status, 400);
  const l = await A.call("GET", "/subcategories");
  assert.equal(l.data.data.subCategories.length, 1);
  const u = await A.call("PUT", `/subcategories/${subA.id}`, { json: { sub_category_name: "Systemic 2", status: false } });
  assert.equal(u.data.data.sub_category_name, "Systemic 2");
  assert.equal(u.data.data.status, false);
  const t = await A.call("PATCH", `/subcategories/status/${subA.id}`);
  assert.equal(t.data.data.status, true);
  assert.deepEqual(Object.keys(t.data.data).sort(), ["id", "status", "updated_at"]);
  assert.equal((await A.call("PUT", "/subcategories/zz", { json: {} })).status, 400);
  assert.equal((await B.call("PUT", `/subcategories/${subA.id}`, { json: { sub_category_name: "H" } })).status, 404);
});

// ---------- crops ----------
let crops;
await step("crops list", async () => {
  const r = await A.call("GET", "/crops");
  assert.equal(r.status, 200);
  assert.equal(r.data.count, 2);
  assert.equal(r.data.crops[0].crop_name, "Rice"); // id DESC
  assert.ok("t_base" in r.data.crops[0] && "category_id" in r.data.crops[0]);
  crops = r.data.crops;
  assert.equal((await new Client().call("GET", "/crops")).status, 401);
});

// ---------- products ----------
let prodA;
const chem = [{ name: "Nitrogen", value: "10%" }];
await step("product create (multipart) / validation / duplicate", async () => {
  const base = { brand_id: brandA.id, category_id: catA.id, sub_category_id: subA.id, product_name: "Roundup", description: "weed killer" };
  const noFields = await A.call("POST", "/products", { form: fd({ ...base, chemical_composition: "{bad" }) });
  assert.equal(noFields.data.message, "Invalid JSON format");
  const miss = await A.call("POST", "/products", { form: fd(base) });
  assert.match(miss.data.message, /are required$/);
  const foreign = await B.call("POST", "/products", { form: fd({ ...base, chemical_composition: JSON.stringify(chem), crop_ids: JSON.stringify([crops[0].id]) }) });
  assert.equal(foreign.data.message, "Invalid brand_id");
  const r = await A.call("POST", "/products", {
    form: fd({ ...base, chemical_composition: JSON.stringify(chem), crop_ids: JSON.stringify([crops[0].id, crops[1].id]) }, { name: "image" }),
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  prodA = r.data.data;
  assert.ok(isSnake(prodA) && prodA.product_name === "Roundup");
  assert.deepEqual(prodA.chemical_composition, chem);
  assert.deepEqual(prodA.crop_ids, [crops[0].id, crops[1].id]);
  assert.match(prodA.image, /\/uploads\/vendor-products\/.+\.png$/);
  const dup = await A.call("POST", "/products", { form: fd({ ...base, product_name: "ROUNDUP", chemical_composition: JSON.stringify(chem), crop_ids: "[1]" }) });
  assert.equal(dup.data.message, "Product already exists");
});
await step("product list / joined get / filters / update / toggle", async () => {
  const l = await A.call("GET", "/products");
  assert.equal(l.data.data.data.length, 1);
  const p = l.data.data.data[0];
  assert.equal(p.brand_name, "Bayer CropScience");
  assert.equal(p.category_name, "Fungicides");
  assert.equal(p.sub_category_name, "Systemic 2");
  assert.ok(isSnake(p) && "crop_ids" in p && "chemical_composition" in p);
  assert.equal(l.data.data.pagination.total, 1);
  assert.equal((await A.call("GET", `/products/${prodA.id}`)).data.data.brand_name, "Bayer CropScience");
  assert.equal((await B.call("GET", `/products/${prodA.id}`)).status, 404);
  for (const path of [`/products/brand/${brandA.id}`, `/products/category/${catA.id}`, `/products/subcategory/${subA.id}`]) {
    const r = await A.call("GET", path);
    assert.equal(r.status, 200);
    assert.equal(r.data.data.length, 1, path);
    assert.equal(r.data.data[0].category_name, "Fungicides");
    assert.equal((await B.call("GET", path)).data.data.length, 0, path);
  }
  // update: JSON string fields, keeps untouched ones
  const u = await A.call("PUT", `/products/${prodA.id}`, {
    form: fd({ product_name: "Roundup Max", crop_ids: JSON.stringify([crops[0].id]) }),
  });
  assert.equal(u.status, 200, JSON.stringify(u.data));
  assert.equal(u.data.data.product_name, "Roundup Max");
  assert.deepEqual(u.data.data.crop_ids, [crops[0].id]);
  assert.deepEqual(u.data.data.chemical_composition, chem);
  assert.equal(u.data.data.description, "weed killer");
  assert.equal(u.data.data.image, prodA.image);
  assert.equal((await A.call("PUT", `/products/${prodA.id}`, { form: fd({ chemical_composition: "nope" }) })).data.message, "chemical_composition must be valid JSON");
  assert.equal((await A.call("PUT", "/products/abc", { form: fd({}) })).data.message, "Invalid product ID format");
  assert.equal((await B.call("PUT", `/products/${prodA.id}`, { form: fd({ product_name: "H" }) })).status, 404);
  const t = await A.call("PATCH", `/products/status/${prodA.id}`);
  assert.equal(t.data.data.status, false);
  assert.deepEqual(Object.keys(t.data.data).sort(), ["id", "status", "updated_at"]);
  assert.equal((await B.call("PATCH", `/products/status/${prodA.id}`)).status, 404);
});

// ---------- inventory ----------
let invA;
await step("inventory CRUD", async () => {
  assert.equal((await A.call("POST", "/inventory", { json: {} })).data.message, "product_id is required");
  assert.equal((await A.call("POST", "/inventory", { json: { product_id: prodA.id } })).data.message, "quantity is required");
  assert.equal((await B.call("POST", "/inventory", { json: { product_id: prodA.id, quantity: 5 } })).data.message, "Product not found for this vendor");
  const c = await A.call("POST", "/inventory", { json: { product_id: prodA.id, quantity: 7 } });
  assert.equal(c.status, 200, JSON.stringify(c.data));
  invA = c.data.data;
  assert.ok(isSnake(invA) && invA.stock_status === "IN_STOCK" && invA.quantity === 7);
  assert.equal((await A.call("POST", "/inventory", { json: { product_id: prodA.id, quantity: 1 } })).data.message, "Inventory already exists for this product");
  const l = await A.call("GET", "/inventory");
  assert.equal(l.data.data.length, 1);
  assert.deepEqual(Object.keys(l.data.data[0]).sort(), ["created_at", "id", "product_id", "product_name", "quantity", "stock_status", "updated_at", "vendor_id"]);
  assert.equal(l.data.data[0].product_name, "Roundup Max");
  const g = await A.call("GET", `/inventory/${invA.id}`);
  assert.equal(g.data.data.product_name, "Roundup Max");
  assert.ok(isSnake(g.data.data));
  assert.equal((await B.call("GET", `/inventory/${invA.id}`)).data.message, "Inventory item not found");
  const u = await A.call("PUT", `/inventory/${invA.id}`, { json: { quantity: 0 } });
  assert.equal(u.data.data.stock_status, "OUT_OF_STOCK");
  assert.equal((await B.call("PUT", `/inventory/${invA.id}`, { json: { quantity: 99 } })).status, 400);
  assert.equal((await B.call("DELETE", `/inventory/${invA.id}`)).status, 400);
  const d = await A.call("DELETE", `/inventory/${invA.id}`);
  assert.deepEqual(d.data, { status: "success", message: "Inventory deleted successfully", data: null });
});

// ---------- service locations ----------
let locA;
await step("service locations (old authorization model preserved)", async () => {
  assert.equal((await A.call("POST", "/service-locations", { json: { vendor_id: vA.id } })).status, 400);
  const c = await A.call("POST", "/service-locations", { json: { vendor_id: vA.id, state: "MH", city: "Pune", pincode: "411001" } });
  assert.equal(c.status, 201);
  locA = c.data.serviceLocation;
  assert.ok(isSnake(locA) && locA.is_serviceable === true && locA.vendor_id === vA.id);
  const dup = await A.call("POST", "/service-locations", { json: { vendor_id: vA.id, state: "MH", city: "Pune", pincode: "411001" } });
  assert.equal(dup.status, 400);
  assert.equal(dup.data.message, "Service location already exists for this vendor");
  const l = await A.call("GET", `/service-locations/${vA.id}`);
  assert.equal(l.data.serviceLocations.length, 1);
  assert.equal((await A.call("GET", `/service-locations/location/${locA.id}`)).data.serviceLocation.city, "Pune");
  assert.equal((await A.call("GET", "/service-locations/location/99999")).status, 404);
  // old behaviour (flagged): vendor B can read vendor A's locations
  assert.equal((await B.call("GET", `/service-locations/${vA.id}`)).data.serviceLocations.length, 1);
  const u = await A.call("PUT", `/service-locations/${locA.id}`, { json: { state: "MH", city: "Nashik", pincode: "422001", is_serviceable: false } });
  assert.equal(u.data.serviceLocation.city, "Nashik");
  assert.equal(u.data.serviceLocation.is_serviceable, false);
  assert.equal((await A.call("PUT", "/service-locations/99999", { json: { state: "a", city: "b", pincode: "c", is_serviceable: true } })).status, 404);
  assert.equal((await A.call("PUT", `/service-locations/${locA.id}`, { json: { city: "only" } })).status, 500); // NOT NULL, same as old
  const d = await A.call("DELETE", `/service-locations/${locA.id}`);
  assert.deepEqual(d.data, { success: true, message: "Service location deleted successfully" });
  assert.equal((await A.call("DELETE", `/service-locations/${locA.id}`)).status, 404);
});

// ---------- bulk delete ----------
await step("bulk delete keeps vendor scope + semantics", async () => {
  // vendor B owns a brand; A must not be able to delete it via bulk
  const bBrand = (await B.call("GET", "/brands")).data.data.data[0];
  assert.equal((await A.call("POST", "/brands/bulk-delete", { json: {} })).data.message, "Please provide an array of brand IDs");
  assert.equal((await A.call("POST", "/brands/bulk-delete", { json: { ids: ["x"] } })).data.message, "No valid brand IDs provided");
  const r = await A.call("POST", "/brands/bulk-delete", { json: { ids: [bBrand.id, "zz"] } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.data, { deletedCount: 0, deletedIds: [bBrand.id] });
  assert.equal(r.data.message, "0 brand(s) deleted successfully");

  const p = await A.call("POST", "/products/bulk-delete", { json: { ids: [prodA.id, String(prodA.id)] } });
  assert.equal(p.data.data.deletedCount, 1);
  assert.equal(p.data.message, "1 product(s) deleted successfully");
  assert.equal((await A.call("POST", "/subcategories/bulk-delete", { json: { ids: [subA.id] } })).data.data.deletedCount, 1);
  assert.equal((await A.call("POST", "/categories/bulk-delete", { json: { ids: [catA.id] } })).data.message, "1 category(s) deleted successfully");
  const del = await A.call("DELETE", `/brands/${brandA.id}`);
  assert.equal(del.data.message, "Vendor brand deleted successfully");
  assert.equal((await A.call("DELETE", `/brands/${brandA.id}`)).status, 404);
});

// ---------- forgot / verify / reset ----------
await step("forgot-password -> verify-otp -> reset-password -> login", async () => {
  const c = new Client();
  assert.equal((await c.call("POST", "/vendor/forgot-password", { json: {} })).data.message, "Email is required");
  const unknown = await c.call("POST", "/vendor/forgot-password", { json: { email: "nobody@v.test" } });
  assert.equal(unknown.status, 200);
  assert.equal(unknown.data.otp, undefined);

  const f = await c.call("POST", "/vendor/forgot-password", { json: { email: "a@v.test" } });
  assert.equal(f.status, 200);
  assert.equal(f.data.message, "An OTP has been sent to your email.");
  assert.match(f.data.otp, /^\d{6}$/);
  const [row] = await db.select().from(s.vendorOtp).where(eq(s.vendorOtp.email, "a@v.test"));
  assert.equal(row.otp, f.data.otp);
  const ttl = (new Date(row.expiresAt) - new Date(row.createdAt)) / 1000;
  assert.ok(ttl > 290 && ttl <= 301, `ttl ${ttl}`);

  assert.equal((await c.call("POST", "/vendor/verify-otp", { json: { email: "a@v.test" } })).status, 400);
  const wrong = await c.call("POST", "/vendor/verify-otp", { json: { email: "a@v.test", otp: "000000" } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.data.message, "Invalid or expired OTP");
  const ok = await c.call("POST", "/vendor/verify-otp", { json: { email: "a@v.test", otp: f.data.otp } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.message, "OTP verified. A password reset link has been sent to your email.");
  assert.equal((await db.select().from(s.vendorOtp).where(eq(s.vendorOtp.email, "a@v.test"))).length, 0);
  assert.equal((await c.call("POST", "/vendor/verify-otp", { json: { email: "a@v.test", otp: f.data.otp } })).status, 401);

  // expired OTP
  await db.insert(s.vendorOtp).values({ vendorId: vA.id, email: "a@v.test", otp: "123456", expiresAt: new Date(Date.now() - 60_000) });
  assert.equal((await c.call("POST", "/vendor/verify-otp", { json: { email: "a@v.test", otp: "123456" } })).status, 401);

  // reset-password (token as emailed: JWT_SECRET:vendor-reset, type password_reset)
  const token = jwt.sign({ id: vA.id, email: "a@v.test", type: "password_reset" }, `${process.env.JWT_SECRET}:vendor-reset`, { expiresIn: "1h" });
  assert.equal((await c.call("POST", "/vendor/reset-password", { json: { token } })).status, 400);
  assert.equal((await c.call("POST", "/vendor/reset-password", { json: { token, newPassword: "a", confirmPassword: "b" } })).data.message, "New password and confirm password do not match");
  assert.equal((await c.call("POST", "/vendor/reset-password", { json: { token: "bad", newPassword: "a", confirmPassword: "a" } })).status, 401);
  const wrongType = jwt.sign({ id: vA.id, type: "x" }, `${process.env.JWT_SECRET}:vendor-reset`);
  assert.equal((await c.call("POST", "/vendor/reset-password", { json: { token: wrongType, newPassword: "a", confirmPassword: "a" } })).data.message, "Invalid reset token");
  const done = await c.call("POST", "/vendor/reset-password", { json: { token, newPassword: "NewPass#1", confirmPassword: "NewPass#1" } });
  assert.equal(done.status, 200);
  assert.equal(done.data.message, "Password reset successfully");
  assert.equal((await new Client().call("POST", "/vendor/login", { json: { email: "a@v.test", password: "Passw0rd!" } })).status, 401);
  assert.equal((await new Client().call("POST", "/vendor/login", { json: { email: "a@v.test", password: "NewPass#1" } })).status, 200);
});
await step("reset-password blocked for unapproved vendor", async () => {
  await db.update(s.vendors).set({ isApprove: false }).where(eq(s.vendors.id, vB.id));
  const token = jwt.sign({ id: vB.id, type: "password_reset" }, `${process.env.JWT_SECRET}:vendor-reset`, { expiresIn: "1h" });
  const r = await new Client().call("POST", "/vendor/reset-password", { json: { token, newPassword: "x", confirmPassword: "x" } });
  assert.equal(r.status, 403);
  assert.equal(r.data.message, "Account is not active or approved");
});
await step("logout clears cookies", async () => {
  const r = await A.call("POST", "/vendor/logout");
  assert.deepEqual(r.data, { success: true, message: "Logout successful" });
  assert.equal(A.cookies.vendor_access_token, undefined);
  assert.equal(A.cookies.vendor_refresh_token, undefined);
  assert.equal((await A.call("GET", "/brands")).status, 401);
});
await step("login rate limiter (10 / 10min) kicks in", async () => {
  const c = new Client();
  let last;
  for (let i = 0; i < 12; i++) last = await c.call("POST", "/vendor/login", { json: { email: "a@v.test", password: "bad" } });
  assert.equal(last.status, 429);
});

console.log(`\nvendor smoke test: ${passed} steps passed`);
server.close();
process.exit(0);
