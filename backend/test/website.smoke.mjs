// Smoke test for the website module. Run from backend/:
//   DB_DRIVER=pglite node test/website.smoke.mjs
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";

process.env.DB_DRIVER = "pglite";
process.env.JWT_SECRET ||= "smoke-test-secret";

const { default: websiteRouter } = await import("../src/modules/website/index.js");
const { deleteFile } = await import("../src/utils/storage.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/website", websiteRouter);

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/website`;

const call = async (method, path, { json, form, cookie } = {}) => {
  const headers = {};
  let body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (form) body = form;
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(base + path, { method, headers, body });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data, res };
};

const uploaded = [];
let failed = false;

try {
  /* ---------- admin auth ---------- */
  let r = await call("POST", "/registeradmin", { json: { email: "a@b.c" } });
  assert.equal(r.status, 400);
  assert.equal(r.data.error, "All fields are required");

  r = await call("POST", "/registeradmin", {
    json: { admin_name: "Root", email: "root@farmseasy.in", password: "pw12345" },
  });
  assert.equal(r.status, 201);
  assert.deepEqual(Object.keys(r.data.admin).sort(), ["admin_id", "admin_name", "email"]);
  assert.match(r.data.admin.admin_id, /^[0-9a-f-]{36}$/);

  r = await call("POST", "/registeradmin", {
    json: { admin_name: "Root", email: "root@farmseasy.in", password: "pw12345" },
  });
  assert.equal(r.status, 409);

  r = await call("POST", "/login", { json: { email: "nobody@x.y", password: "x" } });
  assert.equal(r.status, 404);
  r = await call("POST", "/login", { json: { password: "x" } });
  assert.equal(r.status, 404);
  r = await call("POST", "/login", { json: { email: "root@farmseasy.in", password: "bad" } });
  assert.equal(r.status, 401);

  r = await call("GET", "/login");
  assert.equal(r.status, 401);
  assert.equal(r.data.message, "Unauthorized - No token provided");

  r = await call("POST", "/login", { json: { email: "root@farmseasy.in", password: "pw12345" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.success, true);
  const setCookie = r.res.headers.get("set-cookie");
  assert.match(setCookie, /^website_admin_token=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const cookie = setCookie.split(";")[0];

  r = await call("GET", "/login", { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.data.authenticated, true);
  assert.equal(r.data.user.email, "root@farmseasy.in");

  r = await call("GET", "/login", { cookie: "website_admin_token=garbage" });
  assert.equal(r.status, 401);
  assert.equal(r.data.message, "Invalid or expired token");

  r = await call("POST", "/logout");
  assert.equal(r.status, 200);
  assert.match(r.res.headers.get("set-cookie"), /^website_admin_token=;/);

  /* ---------- jobs ---------- */
  r = await call("POST", "/post-job", {
    json: {
      job_title: "Agronomist",
      location: "Pune",
      salary_range: "5-8 LPA",
      job_type: "Full-time",
      job_description: "<p>desc</p>",
      link: "https://x.y",
    },
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.message, "Job created successfully");
  assert.equal(r.data.job.job_title, "Agronomist");
  assert.ok("job_id" in r.data.job && "created_at" in r.data.job && "salary_range" in r.data.job);
  const jobId = r.data.job.job_id;

  r = await call("POST", "/post-job", { json: { job_title: "Intern", job_type: "Internship" } });
  assert.equal(r.status, 201);
  const job2 = r.data.job.job_id;

  r = await call("POST", "/post-job", { json: { location: "no title" } });
  assert.equal(r.status, 500);
  assert.equal(r.data.error, "Internal Server Error");

  r = await call("GET", "/jobs");
  assert.equal(r.status, 200);
  assert.equal(r.data.jobs.length, 2);
  assert.equal(r.data.jobs[0].job_id, job2); // DESC

  r = await call("PUT", `/update-job/${jobId}`, { json: { job_title: "Senior Agronomist" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.message, "Job updated successfully");
  r = await call("PUT", "/update-job/9999", { json: { job_title: "x" } });
  assert.equal(r.status, 404);
  assert.equal(r.data.message, "Job not found");

  r = await call("GET", "/jobs");
  const updated = r.data.jobs.find((j) => j.job_id === jobId);
  assert.equal(updated.job_title, "Senior Agronomist");
  assert.equal(updated.location, null); // full overwrite

  r = await call("DELETE", `/delete-job/${job2}`);
  assert.equal(r.status, 200);
  r = await call("DELETE", `/delete-job/${job2}`);
  assert.equal(r.status, 404);

  r = await call("DELETE", "/jobs/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/jobs/bulk-delete", { json: { ids: [jobId, 12345] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 1);

  /* ---------- connections ---------- */
  r = await call("POST", "/connections", {
    json: { name: "Farmer", email: "f@x.y", mobile: "9999999999", query: "hello" },
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.message, "Connection created successfully");
  assert.ok("connection_id" in r.data.connection && "created_at" in r.data.connection);
  assert.ok("ip_address" in r.data.connection);
  const connId = r.data.connection.connection_id;

  r = await call("POST", "/connections", { json: { name: "Second" } });
  const connId2 = r.data.connection.connection_id;

  r = await call("GET", "/connections");
  assert.equal(r.data.connections.length, 2);
  assert.equal(r.data.connections[0].connection_id, connId2);

  r = await call("GET", `/connections/${connId}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.connection.name, "Farmer");
  r = await call("GET", "/connections/9999");
  assert.equal(r.status, 404);

  r = await call("PUT", `/connections/${connId}`, { json: { status: "read" } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.connection, {
    name: "Farmer",
    email: "f@x.y",
    mobile: "9999999999",
    query: "hello",
    status: "read",
  });
  r = await call("PUT", "/connections/9999", { json: { status: "read" } });
  assert.equal(r.status, 404);

  r = await call("DELETE", "/connections/bulk-delete", { json: {} });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/connections/bulk-delete", { json: { ids: [4242] } });
  assert.equal(r.status, 404);
  r = await call("DELETE", `/connections/${connId2}`);
  assert.equal(r.status, 200);
  r = await call("DELETE", `/connections/${connId2}`);
  assert.equal(r.status, 404);
  r = await call("DELETE", "/connections/bulk-delete", { json: { ids: [connId] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 1);

  /* ---------- blogs ---------- */
  const blogForm = (fields, files = []) => {
    const f = new FormData();
    for (const [k, v] of fields) f.append(k, v);
    for (const [name, filename, type, content] of files)
      f.append(name, new Blob([content], { type }), filename);
    return f;
  };

  r = await call("POST", "/blogs", { form: blogForm([["title", "No content"]]) });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Title and content are required");

  r = await call("POST", "/blogs", {
    form: blogForm(
      [
        ["title", "Draft post"],
        ["content", "<p>hello world</p>"],
        ["tags", "soil"],
        ["word_count", "2"],
        ["char_count", "18"],
      ],
      [
        ["images", "a.png", "image/png", "png-bytes-a"],
        ["images", "b.jpg", "image/jpeg", "jpg-bytes-b"],
        ["video", "v.mp4", "video/mp4", "mp4-bytes"],
      ],
    ),
  });
  assert.equal(r.status, 201);
  let blog = r.data.blog;
  assert.equal(blog.status, "draft");
  assert.equal(blog.published_at, null);
  assert.deepEqual(blog.tags, ["soil"]);
  assert.equal(blog.images.length, 2);
  assert.match(blog.images[0], /\/blogs\/images\/.+\.png$/);
  assert.match(blog.video, /\/blogs\/videos\/.+\.mp4$/);
  assert.equal(blog.word_count, 2);
  assert.equal(blog.char_count, 18);
  uploaded.push(...blog.images, blog.video);
  const blogId = blog.id;

  r = await call("POST", "/blogs", {
    form: blogForm([
      ["title", "Pub post"],
      ["content", "body"],
      ["status", "published"],
      ["tags", "a"],
      ["tags", "b"],
    ]),
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.blog.status, "published");
  assert.ok(r.data.blog.published_at);
  assert.deepEqual(r.data.blog.tags, ["a", "b"]);
  assert.deepEqual(r.data.blog.images, []);
  assert.equal(r.data.blog.video, null);
  const blogId2 = r.data.blog.id;

  r = await call("POST", "/blogs", {
    form: blogForm([["title", "Bad"], ["content", "x"], ["status", "weird"]]),
  });
  assert.equal(r.status, 500);
  assert.equal(r.data.success, false);

  r = await call("GET", "/blogs");
  assert.equal(r.status, 200);
  assert.equal(r.data.success, true);
  assert.equal(r.data.blogs.length, 2);
  assert.equal(r.data.blogs[0].id, blogId2); // created_at DESC
  assert.ok("word_count" in r.data.blogs[0] && "published_at" in r.data.blogs[0]);

  r = await call("GET", `/blogs/${blogId}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.blog.title, "Draft post");
  r = await call("GET", "/blogs/00000000-0000-0000-0000-000000000000");
  assert.equal(r.status, 404);
  assert.deepEqual(r.data, { success: false });
  r = await call("GET", "/blogs/not-a-uuid");
  assert.equal(r.status, 500);

  // update: publish, replace tags, keep images/video
  r = await call("PUT", `/blogs/${blogId}`, {
    form: blogForm([
      ["title", "Draft post v2"],
      ["content", "<p>edited</p>"],
      ["status", "published"],
      ["word_count", "1"],
      ["char_count", "13"],
      ["tags", "x"],
      ["tags", "y"],
    ]),
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.blog.title, "Draft post v2");
  assert.equal(r.data.blog.status, "published");
  assert.ok(r.data.blog.published_at);
  assert.deepEqual(r.data.blog.tags, ["x", "y"]);
  assert.deepEqual(r.data.blog.images, blog.images);
  assert.equal(r.data.blog.video, blog.video);
  assert.equal(r.data.blog.word_count, 1);

  // update: bracket tags field + new image replaces images
  r = await call("PUT", `/blogs/${blogId}`, {
    form: blogForm(
      [
        ["title", "v3"],
        ["content", "c"],
        ["status", "draft"],
        ["tags[]", "t1"],
        ["tags[]", "t2"],
      ],
      [["images", "c.webp", "image/webp", "webp-bytes"]],
    ),
  });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.blog.tags, ["t1", "t2"]);
  assert.equal(r.data.blog.images.length, 1);
  assert.match(r.data.blog.images[0], /\.webp$/);
  assert.ok(r.data.blog.published_at, "published_at kept when going back to draft");
  uploaded.push(...r.data.blog.images);

  r = await call("PUT", `/blogs/${blogId}`, { form: blogForm([["content", "no title"]]) });
  assert.equal(r.status, 500);
  assert.deepEqual(r.data, { success: false, message: "Update failed" });

  r = await call("DELETE", "/blogs/bulk-delete", { json: { ids: [] } });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/blogs/bulk-delete", {
    json: { ids: ["00000000-0000-0000-0000-000000000000"] },
  });
  assert.equal(r.status, 404);
  r = await call("DELETE", `/blogs/${blogId}`);
  assert.equal(r.status, 200);
  assert.deepEqual(r.data, { success: true, message: "Blog deleted" });
  r = await call("DELETE", "/blogs/bulk-delete", { json: { ids: [blogId2] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 1);
  r = await call("GET", "/blogs");
  assert.equal(r.data.blogs.length, 0);

  /* ---------- team ---------- */
  r = await call("POST", "/team", { form: blogForm([["name", "Only name"]]) });
  assert.equal(r.status, 400);
  assert.equal(r.data.message, "Name and position are required");

  r = await call("POST", "/team", {
    form: blogForm(
      [
        ["name", "Asha"],
        ["position", "CEO"],
        ["thoughts", "Grow"],
        ["is_reversed_layout", "true"],
      ],
      [["image", "asha.png", "image/png", "img-bytes"]],
    ),
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.success, true);
  const member = r.data.team_member;
  assert.match(member.emp_id, /^EMP[0-9A-F]{6}$/);
  assert.match(member.image_url, /\/team\/images\/.+\.png$/);
  assert.equal(member.is_reversed_layout, true);
  assert.equal(member.sub_thoughts, null);
  assert.ok("created_at" in member);
  uploaded.push(member.image_url);

  r = await call("POST", "/team", { form: blogForm([["name", "Bob"], ["position", "CTO"]]) });
  assert.equal(r.status, 201);
  const emp2 = r.data.team_member.emp_id;

  r = await call("GET", "/team");
  assert.equal(r.status, 200);
  assert.equal(r.data.members.length, 2);
  assert.equal(r.data.members[0].emp_id, member.emp_id); // created_at ASC

  r = await call("GET", `/team/${member.emp_id}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.member.name, "Asha");
  r = await call("GET", "/team/EMPNONE");
  assert.equal(r.status, 404);
  assert.equal(r.data.message, "Team member not found");

  r = await call("PUT", `/team/${member.emp_id}`, {
    form: blogForm([["position", "Founder"], ["is_reversed_layout", "false"]]),
  });
  assert.equal(r.status, 200);
  assert.equal(r.data.team_member.position, "Founder");
  assert.equal(r.data.team_member.name, "Asha"); // COALESCE keeps
  assert.equal(r.data.team_member.thoughts, "Grow");
  assert.equal(r.data.team_member.image_url, member.image_url);
  assert.equal(r.data.team_member.is_reversed_layout, false);

  r = await call("PUT", `/team/${member.emp_id}`, {
    form: blogForm([], [["image", "n.png", "image/png", "new-img"]]),
  });
  assert.equal(r.status, 200);
  assert.notEqual(r.data.team_member.image_url, member.image_url);
  uploaded.push(r.data.team_member.image_url);

  r = await call("DELETE", "/team/bulk-delete", { json: {} });
  assert.equal(r.status, 400);
  r = await call("DELETE", "/team/bulk-delete", { json: { ids: [emp2] } });
  assert.equal(r.status, 200);
  assert.equal(r.data.deletedCount, 1);
  r = await call("DELETE", `/team/${member.emp_id}`);
  assert.equal(r.status, 200);
  assert.equal(r.data.message, "Team member deleted successfully");
  r = await call("GET", "/team");
  assert.equal(r.data.members.length, 0);

  console.log("website smoke test: PASS");
} catch (err) {
  failed = true;
  console.error("website smoke test: FAIL");
  console.error(err);
} finally {
  await Promise.all(uploaded.map((u) => deleteFile(u)));
  server.close();
  process.exit(failed ? 1 : 0);
}
