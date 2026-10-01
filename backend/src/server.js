import { env } from "./config/env.js";
import { checkDbConnection, closeDb } from "./db/index.js";
import { createApp } from "./app.js";
import { initAppModule } from "./modules/app/index.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

if (!env.jwtSecret) {
  console.warn("WARNING: JWT_SECRET is not set — authentication will fail.");
}

await checkDbConnection();
await initAppModule(); // optional MongoDB connection + weather cron

const app = createApp();
const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`FarmsEasy API listening on port ${env.port} (${env.nodeEnv})`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received — shutting down`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
