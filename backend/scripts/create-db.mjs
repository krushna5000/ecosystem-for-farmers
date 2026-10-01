// Creates the application role + database described by DB_* in .env (idempotent).
//
//   PG_ADMIN_PASSWORD=<postgres superuser password> npm run db:create
//
// Optional: PG_ADMIN_USER (default "postgres"), PG_ADMIN_DATABASE (default "postgres").
// Connects with the superuser, creates DB_USER / DB_NAME if missing, then grants ownership.
import "dotenv/config";
import pg from "pg";

const { DB_HOST = "localhost", DB_PORT = "5432", DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const adminUser = process.env.PG_ADMIN_USER || "postgres";
const adminPassword = process.env.PG_ADMIN_PASSWORD;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error("DB_NAME, DB_USER and DB_PASSWORD must be set in .env");
  process.exit(1);
}
if (!adminPassword) {
  console.error("Set PG_ADMIN_PASSWORD to the password of your PostgreSQL superuser (default user: postgres).");
  process.exit(1);
}

const ident = (s) => `"${s.replace(/"/g, '""')}"`;
const literal = (s) => `'${s.replace(/'/g, "''")}'`;

const client = new pg.Client({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: adminUser,
  password: adminPassword,
  database: process.env.PG_ADMIN_DATABASE || "postgres",
});

try {
  await client.connect();

  const role = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [DB_USER]);
  if (role.rowCount) {
    await client.query(`ALTER ROLE ${ident(DB_USER)} WITH LOGIN PASSWORD ${literal(DB_PASSWORD)}`);
    console.log(`role "${DB_USER}" already existed — password updated`);
  } else {
    await client.query(`CREATE ROLE ${ident(DB_USER)} WITH LOGIN PASSWORD ${literal(DB_PASSWORD)}`);
    console.log(`role "${DB_USER}" created`);
  }

  const db = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (db.rowCount) {
    console.log(`database "${DB_NAME}" already exists`);
  } else {
    await client.query(`CREATE DATABASE ${ident(DB_NAME)} OWNER ${ident(DB_USER)}`);
    console.log(`database "${DB_NAME}" created`);
  }
  console.log("Next: npm run db:migrate");
} catch (err) {
  console.error("db:create failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
