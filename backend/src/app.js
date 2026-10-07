import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { UPLOADS_DIR } from "./utils/storage.js";

import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Origins of every FarmsEasy frontend (merged from the previous per-portal servers).
const DEFAULT_ORIGINS = [
  // farmer web app / zeocrop
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5177",
  "https://zeocrop.farmseasy.in",
  // admin portal
  "http://localhost:5175",
  // marketing website + AI prototypes (local dev)
  "http://localhost:5179",
  "http://localhost:5181",
  "http://localhost:5182",
  // company + vendor portals
  "http://localhost:5176",
  "http://company.farmseasy.in",
  "https://company.farmseasy.in",
  "http://vendor.farmseasy.in",
  "https://vendor.farmseasy.in",
  // super admin
  "https://superadmin.farmseasy.in",
  // marketing website
  "https://farmseasy.in",
  "https://www.farmseasy.in",
];

const allowedOrigins = new Set([...DEFAULT_ORIGINS, ...env.corsOrigins]);

export function createApp() {
  const app = express();
  if (env.trustProxy) app.set("trust proxy", env.trustProxy);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin(origin, cb) {
        // no Origin header => mobile apps, curl, server-to-server
        if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-Type"],
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(UPLOADS_DIR));

  app.get("/", (req, res) => res.send("FarmsEasy API is running"));
  app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  app.use("/api", apiRouter); // one router per portal — see routes/index.js

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
