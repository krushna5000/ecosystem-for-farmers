// Thin HTTP layer for weather: take the validated request, call the service, send the response.
// No try/catch — Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as appWeatherService from "./appWeather.service.js";
import { sendSuccess, sendJson } from "../../utils/response.js";

export async function getWeatherByFarmId(req, res) {
  const { farm, weather } = await appWeatherService.getWeatherByFarmId(req.params.farm_id);
  sendJson(res, { success: true, farm, weather });
}

export async function getWeatherByCoordinates(req, res) {
  const { weather, cached } = await appWeatherService.getWeatherByCoordinates(req.body);
  sendJson(res, { success: true, weather, cached });
}

export async function storeDailyUserWeather(req, res) {
  const doc = await appWeatherService.storeDailyUserWeather(req.body);
  sendSuccess(res, doc, "Weather data stored successfully");
}
