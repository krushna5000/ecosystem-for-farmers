// Smoke test for the company portal module against in-memory PGlite.
// Run from backend/:  DB_DRIVER=pglite node test/company.smoke.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET = process.env.JWT_SECRET || "smoke-test-secret";

const { default: express } = await import("express");
const { default: cookieParser } = await import("cookie-parser");
const { default: bcrypt } = await import("bcryptjs");
const { db } = await import("../src/db/connection.js");
const S = await import("../src/db/schema/index.js");
const { default: companyRouter } = await import("../src/modules/company/index.js");
const { UPLOADS_DIR, deleteFile } = await import("../src/utils/storage.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/company-portal", companyRouter);
// same shape as src/middleware/errorHandler.js error handler
app.use((err, req, res, next) => {
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({ success: false, message: err.message });
});

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/company-portal`;
const uploaded = [];

let passed = 0;
const check = (name, fn) =>
  Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log(`  ok  ${name}`);
    });

async function call(method, url, { body, cookie, form } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(base + url, { method, headers, body: payload });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, headers: res.headers };
}

const png = () =>
  new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" });

let failed = false;
try {
  // ---------------------------------------------------------------- seed
  const [type] = await db.insert(S.companyTypes).values({ type: "Manufacturer" }).returning();
  const hash = await bcrypt.hash("Passw0rd!", 10);
  const mk = (n, extra = {}) => ({
    companyType: type.id,
    name: `Company ${n}`,
    address: "addr",
    gstNo: `GST${n}`,
    email: `c${n}@test.com`,
    phone: `900000000${n}`,
    password: hash,
    ...extra,
  });
  const [cA, cB, cInactive] = await db
    .insert(S.companies)
    .values([mk(1), mk(2), mk(3, { isActive: false })])
    .returning();

  const [cat1, cat2] = await db
    .insert(S.cropCategories)
    .values([{ categoryName: "Cereal" }, { categoryName: "Vegetable" }])
    .returning();
  const [wheat, corn, tomato] = await db
    .insert(S.crops)
    .values([
      { categoryId: cat1.id, cropName: "Wheat", tBase: 5 },
      { categoryId: cat1.id, cropName: "Corn", tBase: 10, cropStageId: { stages: ["a", "b"] } },
      { categoryId: cat2.id, cropName: "Tomato", tBase: 10 },
    ])
    .returning();

  console.log("auth");
  let cookieA, cookieB;

  await check("login: unknown company -> 404", async () => {
    const r = await call("POST", "/company/login", { body: { email: "nope@x.com", password: "x" } });
    assert.equal(r.status, 404);
    assert.equal(r.json.message, "Company does not exist");
  });
  await check("login: wrong password -> 401", async () => {
    const r = await call("POST", "/company/login", { body: { email: cA.email, password: "bad" } });
    assert.equal(r.status, 401);
    assert.equal(r.json.message, "Invalid password");
  });
  await check("login: deactivated -> 403", async () => {
    const r = await call("POST", "/company/login", { body: { email: cInactive.email, password: "Passw0rd!" } });
    assert.equal(r.status, 403);
  });
  await check("login: ok sets company_token cookie", async () => {
    const r = await call("POST", "/company/login", { body: { email: cA.email, password: "Passw0rd!" } });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "Login successful");
    const sc = r.headers.get("set-cookie");
    assert.match(sc, /company_token=/);
    assert.match(sc, /HttpOnly/i);
    cookieA = sc.split(";")[0];
    const r2 = await call("POST", "/company/login", { body: { email: cB.email, password: "Passw0rd!" } });
    cookieB = r2.headers.get("set-cookie").split(";")[0];
  });
  await check("login: 6th attempt rate limited (429)", async () => {
    const r = await call("POST", "/company/login", { body: { email: cA.email, password: "Passw0rd!" } });
    assert.equal(r.status, 429);
    assert.equal(r.json.status, 429);
  });
  await check("no cookie -> 401, bad cookie -> 403", async () => {
    const a = await call("GET", "/company/profile");
    assert.equal(a.status, 401);
    assert.equal(a.json.message, "Unauthorized. Login first.");
    const b = await call("GET", "/company/profile", { cookie: "company_token=garbage" });
    assert.equal(b.status, 403);
    assert.equal(b.json.message, "Invalid or expired token");
  });
  await check("profile -> snake_case keys", async () => {
    const r = await call("GET", "/company/profile", { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.deepEqual(
      Object.keys(r.json).sort(),
      ["cin_no", "email", "gst_no", "id", "llp_no", "logo_url", "name", "phone"],
    );
    assert.equal(r.json.email, cA.email);
  });
  await check("update-password validations and success", async () => {
    let r = await call("PUT", "/company/update-password", { cookie: cookieB, body: {} });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Request body cannot be empty");
    r = await call("PUT", "/company/update-password", { cookie: cookieB, body: { oldPassword: "x" } });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "oldPassword and newPassword are required");
    r = await call("PUT", "/company/update-password", { cookie: cookieB, body: { oldPassword: "wrong", newPassword: "N3w" } });
    assert.equal(r.status, 401);
    assert.equal(r.json.message, "Incorrect old password");
    r = await call("PUT", "/company/update-password", { cookie: cookieB, body: { oldPassword: "Passw0rd!", newPassword: "N3wPass!" } });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "Password updated successfully");
    const [row] = await db.select().from(S.companies).where((await import("drizzle-orm")).eq(S.companies.id, cB.id));
    assert.ok(await bcrypt.compare("N3wPass!", row.password));
  });
  await check("logout clears cookie", async () => {
    const r = await call("POST", "/company/logout");
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { success: true, message: "Logout successful" });
    assert.match(r.headers.get("set-cookie"), /company_token=;/);
  });

  console.log("brands");
  let brandA, brandB;
  await check("create brand requires name + logo", async () => {
    let f = new FormData();
    let r = await call("POST", "/company/brands/create", { cookie: cookieA, form: f });
    assert.equal(r.status, 400);
    assert.deepEqual(r.json, { status: "error", message: "Brand name is required" });
    f = new FormData();
    f.append("brand_name", "Acme");
    r = await call("POST", "/company/brands/create", { cookie: cookieA, form: f });
    assert.equal(r.json.message, "Brand logo is required");
  });
  await check("create brand uploads logo, returns snake_case row", async () => {
    const f = new FormData();
    f.append("brand_name", " Acme ");
    f.append("logo", png(), "logo.png");
    const r = await call("POST", "/company/brands/create", { cookie: cookieA, form: f });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.status, "success");
    brandA = r.json.data;
    assert.equal(brandA.brand_name, "Acme");
    assert.equal(brandA.company_id, cA.id);
    assert.ok(brandA.created_at);
    assert.match(brandA.logo, /\/uploads\/company\/brands\/.+\.png$/);
    uploaded.push(brandA.logo);
    const file = path.join(UPLOADS_DIR, brandA.logo.split("/uploads/")[1]);
    assert.ok(fs.existsSync(file));
  });
  await check("duplicate brand (case-insensitive) rejected", async () => {
    const f = new FormData();
    f.append("brand_name", "ACME");
    f.append("logo", png(), "l.png");
    const r = await call("POST", "/company/brands/create", { cookie: cookieA, form: f });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Brand already exists for this company");
  });
  await check("non-image upload rejected", async () => {
    const f = new FormData();
    f.append("brand_name", "Bad");
    f.append("logo", new Blob(["x"], { type: "text/plain" }), "x.txt");
    const r = await call("POST", "/company/brands/create", { cookie: cookieA, form: f });
    assert.ok(r.status >= 400);
    assert.match(r.json.message, /Only image files allowed/);
  });
  await check("company B brand", async () => {
    const f = new FormData();
    f.append("brand_name", "BrandB");
    f.append("logo", png(), "l.png");
    const r = await call("POST", "/company/brands/create", { cookie: cookieB, form: f });
    assert.equal(r.status, 200);
    brandB = r.json.data;
    uploaded.push(brandB.logo);
  });
  await check("brands list/table/get are company scoped", async () => {
    let r = await call("GET", "/company/brands", { cookie: cookieA });
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(Object.keys(r.json.data[0]).sort(), ["brand_name", "id", "logo", "status"]);
    r = await call("GET", "/company/brands/table?page=1&limit=5", { cookie: cookieA });
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(r.json.pagination, {
      currentPage: 1, limit: 5, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false,
    });
    assert.ok("created_at" in r.json.data[0] && "updated_at" in r.json.data[0]);
    r = await call("GET", `/company/brands/${brandA.id}`, { cookie: cookieA });
    assert.equal(r.json.data.brand_name, "Acme");
    r = await call("GET", `/company/brands/${brandB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
  });
  await check("update brand (partial, status string from form)", async () => {
    const f = new FormData();
    f.append("brand_name", "Acme Co");
    f.append("status", "false");
    const r = await call("PUT", `/company/brands/${brandA.id}`, { cookie: cookieA, form: f });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.data.brand_name, "Acme Co");
    assert.equal(r.json.data.status, false);
    assert.equal(r.json.data.logo, brandA.logo); // untouched (COALESCE)
    const other = await call("PUT", `/company/brands/${brandB.id}`, { cookie: cookieA, form: new FormData() });
    assert.equal(other.status, 404);
  });

  console.log("categories");
  let catA, catB;
  await check("create category validations", async () => {
    let r = await call("POST", "/company/categories/create", { cookie: cookieA, body: {} });
    assert.equal(r.status, 400);
    r = await call("POST", "/company/categories/create", { cookie: cookieA, body: { brand_id: brandB.id, category_name: "X" } });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Invalid brand_id or brand does not belong to this company");
  });
  await check("create category + duplicate 409", async () => {
    let r = await call("POST", "/company/categories/create", { cookie: cookieA, body: { brand_id: brandA.id, category_name: "Fungicide" } });
    assert.equal(r.status, 201);
    catA = r.json.category;
    assert.equal(catA.category_name, "Fungicide");
    assert.equal(catA.brand_id, brandA.id);
    r = await call("POST", "/company/categories/create", { cookie: cookieA, body: { brand_id: brandA.id, category_name: "fungicide" } });
    assert.equal(r.status, 409);
    r = await call("POST", "/company/categories/create", { cookie: cookieB, body: { brand_id: brandB.id, category_name: "Herbicide" } });
    catB = r.json.category;
  });
  await check("category list/table/get/update/toggle", async () => {
    let r = await call("GET", "/company/categories", { cookie: cookieA });
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(Object.keys(r.json.data[0]).sort(), ["brand_id", "category_name", "id", "status"]);
    r = await call("GET", "/company/categories/table", { cookie: cookieA });
    assert.equal(r.json.pagination.totalItems, 1);
    r = await call("GET", `/company/categories/${catA.id}`, { cookie: cookieA });
    assert.equal(r.json.category.category_name, "Fungicide");
    r = await call("GET", `/company/categories/${catB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    r = await call("PUT", `/company/categories/${catA.id}`, { cookie: cookieA, body: { brand_id: brandA.id, category_name: "Fungicides" } });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.category_name, "Fungicides");
    r = await call("PATCH", `/company/categories/status/${catA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    r = await call("GET", `/company/categories/${catA.id}`, { cookie: cookieA });
    assert.equal(r.json.category.status, false);
    r = await call("PATCH", `/company/categories/status/${catB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    await call("PATCH", `/company/categories/status/${catA.id}`, { cookie: cookieA });
  });

  console.log("sub-categories");
  let subA, subB;
  await check("sub-category create/dup/list/table/get/update/toggle", async () => {
    let r = await call("POST", "/company/subcategories", { cookie: cookieA, body: { brand_id: brandA.id, category_id: catA.id, sub_category_name: "Systemic" } });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    subA = r.json.data;
    assert.equal(subA.sub_category_name, "Systemic");
    r = await call("POST", "/company/subcategories", { cookie: cookieA, body: { brand_id: brandA.id, category_id: catA.id, sub_category_name: "SYSTEMIC" } });
    assert.equal(r.status, 400);
    r = await call("POST", "/company/subcategories", { cookie: cookieA, body: { brand_id: brandA.id, category_id: catB.id, sub_category_name: "Z" } });
    assert.equal(r.json.message, "Invalid category_id for this company");
    r = await call("POST", "/company/subcategories", { cookie: cookieB, body: { brand_id: brandB.id, category_id: catB.id, sub_category_name: "Contact" } });
    subB = r.json.data;
    r = await call("GET", "/company/subcategories", { cookie: cookieA });
    assert.equal(r.json.data.length, 1);
    r = await call("GET", "/company/subcategories/table", { cookie: cookieA });
    assert.equal(r.json.pagination.totalItems, 1);
    r = await call("GET", `/company/subcategories/${subA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    r = await call("GET", `/company/subcategories/${subB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    r = await call("PUT", `/company/subcategories/${subA.id}`, { cookie: cookieA, body: { sub_category_name: "Systemic 2" } });
    assert.equal(r.json.data.sub_category_name, "Systemic 2");
    assert.equal(r.json.data.brand_id, brandA.id);
    r = await call("PATCH", `/company/subcategories/status/${subA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.json.data).sort(), ["id", "status", "updated_at"]);
    assert.equal(r.json.data.status, false);
    r = await call("PATCH", `/company/subcategories/status/${subB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    await call("PATCH", `/company/subcategories/status/${subA.id}`, { cookie: cookieA });
  });

  console.log("products");
  let prodA, prodA2, prodB;
  const prodForm = (o, withImage = false) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.append(k, v);
    if (withImage) f.append("image", png(), "p.png");
    return f;
  };
  await check("create product: validation + JSON parse errors", async () => {
    let r = await call("POST", "/company/products", { cookie: cookieA, form: prodForm({ product_name: "X" }) });
    assert.equal(r.status, 400);
    r = await call("POST", "/company/products", { cookie: cookieA, form: prodForm({ chemical_composition: "{not json" }) });
    assert.equal(r.json.message, "Invalid JSON format");
  });
  await check("create product via multipart (JSON strings) with image", async () => {
    const r = await call("POST", "/company/products", {
      cookie: cookieA,
      form: prodForm(
        {
          brand_id: brandA.id,
          category_id: catA.id,
          sub_category_id: subA.id,
          product_name: " Mancozeb 75 ",
          description: "desc",
          chemical_composition: JSON.stringify([{ name: "Mancozeb", percentage: 75 }]),
          crop_ids: JSON.stringify([tomato.id, wheat.id]),
          disease_names: JSON.stringify(["Late Blight", "Rust"]),
        },
        true,
      ),
    });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    prodA = r.json.data;
    assert.equal(prodA.product_name, "Mancozeb 75");
    assert.deepEqual(prodA.crop_ids, [tomato.id, wheat.id]);
    assert.deepEqual(prodA.disease_names, ["Late Blight", "Rust"]);
    assert.deepEqual(prodA.chemical_composition, [{ name: "Mancozeb", percentage: 75 }]);
    assert.match(prodA.image, /\/uploads\/company\/products\/.+\.png$/);
    uploaded.push(prodA.image);
  });
  await check("create product via JSON body; duplicate rejected", async () => {
    let r = await call("POST", "/company/products", {
      cookie: cookieA,
      body: {
        brand_id: brandA.id, category_id: catA.id, sub_category_id: subA.id,
        product_name: "Copper Oxy",
        chemical_composition: [{ name: "Copper oxychloride", percentage: 50 }],
        crop_ids: [tomato.id], disease_names: ["Late Blight"],
      },
    });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    prodA2 = r.json.data;
    r = await call("POST", "/company/products", {
      cookie: cookieA,
      body: {
        brand_id: brandA.id, category_id: catA.id, sub_category_id: subA.id,
        product_name: "mancozeb 75", chemical_composition: [{ n: 1 }], crop_ids: [1],
      },
    });
    assert.equal(r.json.message, "Product already exists");
    r = await call("POST", "/company/products", {
      cookie: cookieA,
      body: {
        brand_id: brandB.id, category_id: catA.id, sub_category_id: subA.id,
        product_name: "Foreign", chemical_composition: [{ n: 1 }], crop_ids: [1],
      },
    });
    assert.equal(r.json.message, "Invalid brand_id");
    r = await call("POST", "/company/products", {
      cookie: cookieB,
      body: {
        brand_id: brandB.id, category_id: catB.id, sub_category_id: subB.id,
        product_name: "Glyphosate", chemical_composition: [{ name: "Glyphosate", percentage: 41 }],
        crop_ids: [corn.id],
      },
    });
    prodB = r.json.data;
  });
  await check("product list/table/get", async () => {
    let r = await call("GET", "/company/products", { cookie: cookieA });
    assert.equal(r.json.data.length, 2);
    assert.deepEqual(
      Object.keys(r.json.data[0]).sort(),
      ["brand_id", "category_id", "category_name", "chemical_composition", "id", "image", "product_name", "status", "sub_category_id", "sub_category_name"],
    );
    r = await call("GET", "/company/products/table?limit=1&page=2", { cookie: cookieA });
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(r.json.pagination, { currentPage: 2, limit: 1, totalItems: 2, totalPages: 2, hasNext: false, hasPrev: true });
    for (const k of ["brand_name", "category_name", "sub_category_name", "crop_ids", "disease_names", "company_id", "created_at"])
      assert.ok(k in r.json.data[0], k);
    r = await call("GET", `/company/products/${prodA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.brand_name, "Acme Co");
    assert.equal(r.json.data.sub_category_name, "Systemic 2");
    assert.ok("chemical_composition" in r.json.data && "company_id" in r.json.data);
    r = await call("GET", `/company/products/${prodB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
  });
  await check("update product (partial) + toggle + scoping", async () => {
    let r = await call("PUT", `/company/products/${prodA.id}`, {
      cookie: cookieA,
      form: prodForm({ description: "new desc", crop_ids: JSON.stringify([wheat.id]) }),
    });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.data.description, "new desc");
    assert.deepEqual(r.json.data.crop_ids, [wheat.id]);
    assert.equal(r.json.data.product_name, "Mancozeb 75");
    assert.deepEqual(r.json.data.disease_names, ["Late Blight", "Rust"]);
    r = await call("PUT", `/company/products/${prodA.id}`, { cookie: cookieA, form: prodForm({ chemical_composition: "{bad" }) });
    assert.equal(r.json.message, "chemical_composition must be valid JSON");
    r = await call("PUT", `/company/products/abc`, { cookie: cookieA, form: prodForm({}) });
    assert.equal(r.json.message, "Invalid product ID format");
    r = await call("PUT", `/company/products/${prodB.id}`, { cookie: cookieA, form: prodForm({ description: "hack" }) });
    assert.equal(r.status, 404);
    // restore crops for recommendation tests
    await call("PUT", `/company/products/${prodA.id}`, { cookie: cookieA, body: { crop_ids: [tomato.id, wheat.id] } });
    r = await call("PATCH", `/company/products/status/${prodA2.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.status, false);
    r = await call("PATCH", `/company/products/status/${prodB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    r = await call("PATCH", `/company/products/status/${prodA2.id}`, { cookie: cookieA });
    assert.equal(r.json.data.status, true);
  });

  console.log("recommendation (public)");
  await check("needs at least one param", async () => {
    const r = await call("GET", "/company/products/recommendation");
    assert.equal(r.status, 400);
    assert.equal(r.json.success, false);
  });
  await check("exact -> disease -> crop priorities, partial crop name resolution", async () => {
    let r = await call("GET", "/company/products/recommendation?cropName=tomato&diseaseName=late%20blight&chemicalComposition=mancozeb");
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.status, "success");
    assert.equal(r.json.cropIdResolved, tomato.id);
    assert.equal(r.json.breakdown.exact_match, 1);
    assert.equal(r.json.data[0].product_name, "Mancozeb 75");
    assert.equal(r.json.data[0].match_type, "exact");
    assert.equal(r.json.breakdown.disease_match, 1); // Copper Oxy
    assert.equal(r.json.data[1].match_type, "disease");
    assert.equal(r.json.count, 2);
    for (const k of ["brand_name", "category_name", "sub_category_name", "crop_ids", "disease_names", "chemical_composition"])
      assert.ok(k in r.json.data[0], k);
    // partial match: "Tomato (Hybrid)" contains "Tomato"
    r = await call("GET", "/company/products/recommendation?cropName=" + encodeURIComponent("Tomato (Hybrid)"));
    assert.equal(r.json.cropIdResolved, tomato.id);
    assert.equal(r.json.breakdown.crop_match, 2);
    // unknown crop + disease + chemical -> fallback only
    r = await call("GET", "/company/products/recommendation?cropName=Unobtainium&diseaseName=Rust&chemicalComposition=nothing");
    assert.equal(r.json.cropIdResolved, null);
    assert.equal(r.json.breakdown.fallback_match, 1);
    assert.equal(r.json.data[0].product_name, "Mancozeb 75");
    // inactive products are excluded
    await call("PATCH", `/company/products/status/${prodA2.id}`, { cookie: cookieA });
    r = await call("GET", "/company/products/recommendation?cropName=Tomato");
    assert.equal(r.json.count, 1);
    await call("PATCH", `/company/products/status/${prodA2.id}`, { cookie: cookieA });
  });

  console.log("inventory");
  let invA, invB;
  await check("inventory create/validate/list/get/update", async () => {
    let r = await call("POST", "/company/inventory", { cookie: cookieA, body: {} });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "product_id is required");
    r = await call("POST", "/company/inventory", { cookie: cookieA, body: { product_id: prodA.id } });
    assert.equal(r.json.message, "quantity is required");
    r = await call("POST", "/company/inventory", { cookie: cookieA, body: { product_id: prodB.id, quantity: 5 } });
    assert.equal(r.json.message, "Product not found for this company");
    r = await call("POST", "/company/inventory", { cookie: cookieA, body: { product_id: prodA.id, quantity: 10 } });
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal(r.json.success, true);
    invA = r.json.data;
    assert.equal(invA.stock_status, "IN_STOCK");
    assert.equal(invA.product_id, prodA.id);
    r = await call("POST", "/company/inventory", { cookie: cookieA, body: { product_id: prodA.id, quantity: 1 } });
    assert.equal(r.json.message, "Inventory already exists for this product");
    r = await call("POST", "/company/inventory", { cookie: cookieB, body: { product_id: prodB.id, quantity: 0 } });
    invB = r.json.data;
    assert.equal(invB.stock_status, "OUT_OF_STOCK");

    r = await call("GET", "/company/inventory?page=1&limit=10", { cookie: cookieA });
    assert.equal(r.json.status, "success");
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(
      Object.keys(r.json.data[0]).sort(),
      ["chemical_composition", "created_at", "id", "product_id", "product_name", "quantity", "stock_status", "updated_at"],
    );
    assert.equal(r.json.pagination.totalItems, 1);
    r = await call("GET", `/company/inventory/${invA.id}`, { cookie: cookieA });
    assert.equal(r.json.data.product_name, "Mancozeb 75");
    r = await call("GET", `/company/inventory/${invB.id}`, { cookie: cookieA });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Inventory item not found");
    r = await call("PUT", `/company/inventory/${invA.id}`, { cookie: cookieA, body: { quantity: 0 } });
    assert.equal(r.json.data.stock_status, "OUT_OF_STOCK");
    r = await call("PUT", `/company/inventory/${invB.id}`, { cookie: cookieA, body: { quantity: 99 } });
    assert.equal(r.json.message, "Inventory item not found");
  });

  console.log("leads + crops");
  await check("leads list + status update (scoped)", async () => {
    const [l1, l2] = await db
      .insert(S.leads)
      .values([
        { companyId: cA.id, productId: prodA.id, phoneNumber: "9111111111", source: "whatsapp" },
        { companyId: cB.id, productId: prodB.id, phoneNumber: "9222222222" },
      ])
      .returning();
    let r = await call("GET", "/company/leads", { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.length, 1);
    assert.deepEqual(Object.keys(r.json.data[0]).sort(), ["created_at", "id", "phone_number", "product_name", "source", "status"]);
    assert.equal(r.json.data[0].product_name, "Mancozeb 75");
    assert.equal(r.json.data[0].status, "new");
    r = await call("PATCH", `/company/leads/${l1.id}`, { cookie: cookieA, body: { status: "bogus" } });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Invalid status");
    r = await call("PATCH", `/company/leads/${l1.id}`, { cookie: cookieA, body: { status: "contacted" } });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.status, "contacted");
    assert.equal(r.json.data.phone_number, "9111111111");
    r = await call("PATCH", `/company/leads/${l2.id}`, { cookie: cookieA, body: { status: "converted" } });
    assert.equal(r.status, 200);
    assert.equal(r.json.data, undefined);
    const [still] = await db.select().from(S.leads).where((await import("drizzle-orm")).eq(S.leads.id, l2.id));
    assert.equal(still.status, "new");
  });
  await check("crops list paginated (auth required)", async () => {
    let r = await call("GET", "/crops");
    assert.equal(r.status, 401);
    r = await call("GET", "/crops?page=1&limit=2", { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.success, true);
    assert.equal(r.json.data.length, 2);
    assert.equal(r.json.data[0].id, tomato.id); // id DESC
    assert.ok("crop_name" in r.json.data[0] && "t_base" in r.json.data[0] && "category_id" in r.json.data[0]);
    assert.deepEqual(r.json.pagination, { currentPage: 1, limit: 2, totalItems: 3, totalPages: 2, hasNext: true, hasPrev: false });
    assert.deepEqual(r.json.data[1].crop_stage_id, { stages: ["a", "b"] });
  });

  console.log("deletes");
  await check("delete + bulk-delete are company scoped", async () => {
    // inventory
    let r = await call("DELETE", `/company/inventory/${invB.id}`, { cookie: cookieA });
    assert.equal(r.status, 400);
    r = await call("POST", "/company/inventory/bulk-delete", { cookie: cookieA, body: { ids: [invB.id] } });
    assert.equal(r.status, 404);
    r = await call("POST", "/company/inventory/bulk-delete", { cookie: cookieA, body: { ids: ["x"] } });
    assert.equal(r.status, 400);
    assert.equal(r.json.message, "Invalid inventory ID format");
    r = await call("POST", "/company/inventory/bulk-delete", { cookie: cookieA, body: {} });
    assert.equal(r.json.message, "Array of inventory IDs is required");
    r = await call("DELETE", `/company/inventory/${invA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "Inventory deleted successfully");
    r = await call("POST", "/company/inventory/bulk-delete", { cookie: cookieB, body: { ids: [invB.id] } });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "1 inventory item(s) deleted successfully");
    assert.equal(r.json.data[0].id, invB.id);

    // products
    r = await call("DELETE", `/company/products/${prodB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    r = await call("POST", "/company/products/bulk-delete", { cookie: cookieA, body: { ids: [prodB.id, prodA2.id] } });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "1 product(s) deleted successfully");
    r = await call("DELETE", `/company/products/${prodA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.id, prodA.id);
    const [stillB] = await db.select().from(S.companyProducts).where((await import("drizzle-orm")).eq(S.companyProducts.id, prodB.id));
    assert.ok(stillB);

    // sub-categories
    r = await call("POST", "/company/subcategories/bulk-delete", { cookie: cookieA, body: { ids: [subB.id] } });
    assert.equal(r.status, 404);
    r = await call("DELETE", `/company/subcategories/${subA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    r = await call("DELETE", `/company/subcategories/${subA.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);

    // categories
    r = await call("POST", "/company/categories/bulk-delete", { cookie: cookieA, body: { ids: [catB.id] } });
    assert.equal(r.status, 404);
    assert.equal(r.json.message, "No categories found to delete");
    r = await call("DELETE", `/company/categories/${catA.id}`, { cookie: cookieA });
    assert.equal(r.status, 200);
    assert.equal(r.json.data.id, catA.id);
    r = await call("DELETE", `/company/categories/abc`, { cookie: cookieA });
    assert.equal(r.status, 400);

    // brands
    r = await call("DELETE", `/company/brands/${brandB.id}`, { cookie: cookieA });
    assert.equal(r.status, 404);
    r = await call("POST", "/company/brands/bulk-delete", { cookie: cookieA, body: { ids: [brandA.id, brandB.id] } });
    assert.equal(r.status, 200);
    assert.equal(r.json.message, "1 brand(s) deleted successfully");
    r = await call("POST", "/company/brands/bulk-delete", { cookie: cookieB, body: { ids: [brandB.id] } });
    assert.equal(r.status, 200);
    // cascade check
    const left = await db.select().from(S.companyBrands);
    assert.equal(left.length, 0);
  });
} catch (err) {
  failed = true;
  console.error("\nSMOKE TEST FAILED:", err);
} finally {
  for (const url of uploaded) await deleteFile(url);
  server.close();
}

if (failed) process.exit(1);
console.log(`\ncompany smoke test passed (${passed} groups)`);
process.exit(0);
