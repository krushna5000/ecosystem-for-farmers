import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import locationRoutes from "./routes/locationRoutes.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import cropCategoriesRoutes from "./routes/cropCategoriesRoutes.js";
import cropStagesRoutes from "./routes/cropStagesRoutes.js";
import { cropsRoutes } from "./routes/cropsRoutes.js";
import pool from "./config/db.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Test database connection
pool.query("SELECT 1", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connection successful");
  }
});

const app = express();

app.use(helmet());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://superadmin.farmseasy.in"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.get("/", (req, res) => {
  res.send("🌍 Location API Server Running...");
});

app.use(express.json());
app.use("/api/crop-categories", cropCategoriesRoutes);
app.use("/api/crop-stages", cropStagesRoutes);
app.use("/api/crops", cropsRoutes);
app.use("/api", adminRoutes);
app.use("/api/location", locationRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
