// const { Pool } = require("pg");
// require("dotenv").config();

// // Check if running in production (Render)
// const isProduction = process.env.NODE_ENV === "production";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isProduction
//     ? { rejectUnauthorized: false } // Required for Render
//     : false,                        // Disable SSL locally
// });
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: isProduction ? { rejectUnauthorized: false } : false,
// });

// const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
//   ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
// });

// pool.on("connect", () => {
//   console.log("✅ Connected to PostgreSQL database");
// });

// module.exports = pool;

// pool.connect()
//   .then(() => console.log("📦 Connected to PostgreSQL"))
//   .catch((err) => console.error("❌ Database connection error:", err));

// module.exports = pool;





const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: false //process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("✅ Connected to RDS PostgreSQL"))
  .catch((err) => console.error("❌ RDS Database connection error:", err));

module.exports = pool;