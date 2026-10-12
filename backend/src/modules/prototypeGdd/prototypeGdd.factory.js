// Pure DB I/O for the GDD prototype's MongoDB collections (optional — only when MONGO_URI is connected).
// No business rules, no HTTP types.
import { isMongoConnected } from "../../db/mongo.js";
import { GDD, Weather } from "./prototypeGdd.schema.js";

/** True when a MongoDB connection is available to persist results into. */
export const isGddStoreConnectedInDB = () => isMongoConnected();

export function createGddResultInDB({ cropName, T_Base, totalGDD }) {
  return GDD.create({ cropName, T_Base, GDD: totalGDD });
}

export function createWeatherSnapshotInDB({ cropName, Latitude, Longitude, T_Base, forecast }) {
  return Weather.create({ cropName, Latitude, Longitude, T_Base, forecast });
}
