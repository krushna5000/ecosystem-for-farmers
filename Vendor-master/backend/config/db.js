import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Enable SSL only when explicitly requested (e.g. AWS RDS). Local Postgres doesn't support SSL.
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log("DataBase Connected Successfully");
});

pool.on('error', (err) => {
  console.error("DataBase Connection Failed:", err);
});

export default pool;
