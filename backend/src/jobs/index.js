import { startWeatherCron } from "./schedulers/weatherCron.scheduler.js";

// Starts every in-process scheduler. Called once from server.js after the DB is up.
export function startSchedulers() {
  startWeatherCron();
}
