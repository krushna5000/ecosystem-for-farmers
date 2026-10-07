// Runs every smoke test in sequence against in-memory PGlite.   npm test
import { spawnSync } from "node:child_process";

const suites = [
  "app-core", "app-ai", "admin", "super-admin", "company", "vendor", "website", "prototypes", "integration",
];
let failed = 0;
for (const name of suites) {
  const r = spawnSync(process.execPath, [`test/${name}.smoke.mjs`], {
    env: { ...process.env, DB_DRIVER: "pglite", JWT_SECRET: process.env.JWT_SECRET || "test-secret" },
    encoding: "utf8",
  });
  const ok = r.status === 0;
  if (!ok) { failed++; console.error(r.stdout.split("\n").slice(-15).join("\n"), r.stderr.split("\n").slice(-15).join("\n")); }
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(failed ? `\n${failed} suite(s) failed` : `\nall ${suites.length} suites passed`);
process.exit(failed ? 1 : 0);
