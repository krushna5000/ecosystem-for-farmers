import mongoose from "mongoose";
import { env } from "../config/env.js";

// fail fast instead of buffering model calls for 10s when Mongo is not connected
mongoose.set("bufferCommands", false);

let connected = false;

/**
 * Optional MongoDB connection. Only the farmer-app AI features (crop diagnosis,
 * weather history, agronomy/CLSM, stress, field indexes) use Mongo; everything
 * else is PostgreSQL via Drizzle. Skipped when MONGO_URI is not set.
 */
export async function connectMongo() {
  if (connected) return true;
  if (!env.mongoUri) {
    console.warn("MONGO_URI not set — skipping MongoDB connection. Mongo-backed routes will not work.");
    return false;
  }
  try {
    const conn = await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
    connected = conn.connections[0].readyState === 1;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
  return connected;
}

export const isMongoConnected = () => connected;
