// require("dotenv").config();
// const bcrypt = require("bcryptjs");
// const pool = require("./config/db"); // make sure this path points to your db config

// const createSuperAdmin = async () => {
//     try {
//         const name = "Super Admin";
//         const email = process.env.SUPERADMIN_EMAIL || "superadmin@example.com";
//         const password = process.env.SUPERADMIN_PASSWORD || "password123";
//         const role = "super_admin";
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const existingAdmin = await pool.query(
//             "SELECT * FROM super_admins WHERE email = $1",
//             [email]
//         );

//         if (existingAdmin.rows.length > 0) {
//             console.log("Super Admin already exists!");
//             process.exit();
//         }

//         const result = await pool.query(
//             "INSERT INTO super_admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
//             [name, email, hashedPassword, role]
//         );

//         console.log("✅ Super Admin created successfully:", result.rows[0]);
//         process.exit();
//     } catch (error) {
//         console.error("❌ Error creating Super Admin:", error.message);
//         process.exit(1);
//     }
// };

// createSuperAdmin();
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const email = "superadmin@example.com";   // your super admin email
const password = "password123";           // your password
const name = "Super Admin";

(async () => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await pool.query(
    "SELECT * FROM super_admins WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    console.log("Super Admin already exists!");
    process.exit(0);
  }

  await pool.query(
    "INSERT INTO super_admins (name, email, password) VALUES ($1, $2, $3)",
    [name, email, hashedPassword]
  );

  console.log("✅ Super Admin created successfully!");
  process.exit(0);
})();
