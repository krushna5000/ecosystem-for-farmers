import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),

  ssl: {
    rejectUnauthorized: false,
  },

  // ssl: false
});

pool
  .query("SELECT 1")
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch((err) => console.error("PostgreSQL connection failed:", err.message));

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
