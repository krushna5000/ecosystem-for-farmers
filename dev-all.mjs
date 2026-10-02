#!/usr/bin/env node
// Starts the unified backend and every web frontend at once.
//
//   node dev-all.mjs                 start everything (installs missing node_modules first)
//   node dev-all.mjs --only=backend,admin,company   start a subset (names below)
//   node dev-all.mjs --list          print the services and ports
//
// Ctrl+C stops all of them. Each service logs with its own coloured prefix.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === "win32";
const npm = isWin ? "npm.cmd" : "npm";

const SERVICES = [
  { name: "backend", dir: "backend", port: 5000, label: "Unified API (Express + Drizzle)", path: "/health" },
  { name: "superadmin", dir: "SuperAdmin-main/Frontend", port: 5173, label: "Super Admin portal" },
  { name: "company", dir: "Company/frontend", port: 5174, label: "Company portal" },
  { name: "admin", dir: "AdminFarmseasy/Frontend", port: 5175, label: "Admin portal" },
  { name: "vendor", dir: "Vendor-master/frontend", port: 5176, label: "Vendor portal" },
  { name: "webapp", dir: "WebApp/Frontend", port: 5177, label: "Farmer web app" },
  { name: "agri", dir: "AgriDashboard-main/frontend", port: 5178, label: "Agri dashboard (static UI)" },
  { name: "website", dir: "FARMSEASY.IN-main/Frontend", port: 5179, label: "farmseasy.in website + CMS" },
  { name: "marketplace", dir: "New-Marketplace-main/Frontend", port: 5180, label: "New marketplace (static UI)" },
  { name: "gdd", dir: "FarmsEasy-AI-main/GDD/Frontend", port: 5181, label: "GDD calculator prototype" },
  { name: "map", dir: "FarmsEasy-AI-main/MapPrototype/frontend", port: 5182, label: "Farm map prototype" },
  { name: "product", dir: "FarmsEasy-AI-main/Product Prototype", port: 5183, label: "Product prototype (static UI)" },
];

const args = process.argv.slice(2);
if (args.includes("--list")) {
  for (const s of SERVICES) console.log(`${s.name.padEnd(12)} :${s.port}  ${s.label}`);
  process.exit(0);
}
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").map((s) => s.trim()) : null;
const selected = SERVICES.filter((s) => !only || only.includes(s.name));
if (only) {
  const unknown = only.filter((n) => !SERVICES.some((s) => s.name === n));
  if (unknown.length) {
    console.error(`Unknown service(s): ${unknown.join(", ")}. Try --list.`);
    process.exit(1);
  }
}

const colors = [36, 32, 33, 35, 34, 31, 96, 92, 93, 95, 94, 91];
const width = Math.max(...selected.map((s) => s.name.length));
const tag = (s, i) => `\x1b[${colors[i % colors.length]}m${s.name.padEnd(width)} |\x1b[0m`;

// ---- install missing dependencies (npm ci when a lockfile exists, so lockfiles stay untouched)
for (const s of selected) {
  const cwd = path.join(root, s.dir);
  if (!fs.existsSync(path.join(cwd, "package.json"))) {
    console.error(`${s.name}: ${s.dir}/package.json not found`);
    process.exit(1);
  }
  if (fs.existsSync(path.join(cwd, "node_modules"))) continue;
  const cmd = fs.existsSync(path.join(cwd, "package-lock.json")) ? "ci" : "install";
  console.log(`[install] ${s.name}: npm ${cmd} …`);
  const r = spawnSync(npm, [cmd, "--no-audit", "--no-fund"], { cwd, stdio: "inherit", shell: isWin });
  if (r.status !== 0) {
    console.error(`[install] ${s.name} failed`);
    process.exit(r.status ?? 1);
  }
}

if (selected.some((s) => s.name === "backend") && !fs.existsSync(path.join(root, "backend/.env"))) {
  console.warn("\n⚠  backend/.env is missing — copy backend/.env.example and fill in the DB_* values.\n");
}

// ---- start everything
const children = [];
let stopping = false;

const killTree = (child) => {
  if (!child.pid) return;
  try {
    if (isWin) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(-child.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
};

const shutdown = () => {
  if (stopping) return;
  stopping = true;
  console.log("\nStopping all services …");
  children.forEach(killTree);
  setTimeout(() => process.exit(0), 500);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

selected.forEach((s, i) => {
  const child = spawn(npm, ["run", "dev"], {
    cwd: path.join(root, s.dir),
    shell: isWin,
    detached: !isWin,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  children.push(child);
  const pipe = (stream) => {
    let buf = "";
    stream.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) if (line.trim()) console.log(`${tag(s, i)} ${line}`);
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);
  child.on("exit", (code) => {
    if (!stopping) console.log(`${tag(s, i)} exited with code ${code}`);
  });
});

setTimeout(() => {
  if (stopping) return;
  console.log("\n  Service       URL");
  for (const s of selected) {
    console.log(`  ${s.name.padEnd(12)}  http://localhost:${s.port}${s.path ?? ""}   ${s.label}`);
  }
  console.log("\n  Ctrl+C stops everything.\n");
}, 6000);
