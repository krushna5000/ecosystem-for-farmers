import { connectMongo } from "../../db/mongo.js";
import { startWeatherCron } from "./services/weatherCronService.js";

// Called once from server.js before the HTTP server starts.
export async function initAppModule() {
  await connectMongo();
  startWeatherCron();
}
