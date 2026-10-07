import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

let pool = null;
let db;

if (process.env.DB_DRIVER === "pglite") {
  // Test/dev only: in-memory PostgreSQL (WASM) with the Drizzle migrations applied.
  // Usage: DB_DRIVER=pglite node ...   (devDependency @electric-sql/pglite)
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite();
  db = drizzlePglite(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("DB driver: PGlite (in-memory) — migrations applied");
} else {
  const ssl = env.db.ssl ? { rejectUnauthorized: false } : false;

  pool = new pg.Pool(
    env.databaseUrl
      ? { connectionString: env.databaseUrl, ssl }
      : {
          host: env.db.host,
          port: env.db.port,
          database: env.db.name,
          user: env.db.user,
          password: env.db.password,
          ssl,
        },
  );

  pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err.message);
  });

  /** Drizzle instance — `db.select().from(schema.users)...` or `db.query.users.findMany()` */
  db = drizzle(pool, { schema });
}

export async function checkDbConnection() {
  try {
    await db.execute("SELECT 1");
    console.log("PostgreSQL connected successfully");
    return true;
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    return false;
  }
}

export async function closeDb() {
  if (pool) await pool.end().catch(() => {});
}

export { db, pool, schema };
