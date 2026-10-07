import { env } from "./src/config/env.js";
import { checkDbConnection, closeDb } from "./src/db/connection.js";
import { createApp } from "./src/app.js";
import { connectMongo } from "./src/db/mongo.js";
import { startSchedulers } from "./src/jobs/index.js";

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
await connectMongo(); // optional — only the farmer-app AI features use Mongo
startSchedulers(); // weather cron

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
