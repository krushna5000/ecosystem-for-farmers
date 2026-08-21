import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DB_HOST) {
  throw new Error("DB_HOST is NOT loaded before db.js");
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),

  // ✅ REQUIRED FOR AWS RDS
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

export default pool;
