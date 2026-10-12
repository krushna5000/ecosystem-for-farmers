import { Router } from "express";
import { authenticateApp } from "../../middleware/appAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { weatherByCoordinatesSchema, storeDailyWeatherSchema } from "./appWeather.validator.js";
import * as appWeatherController from "./appWeather.controller.js";

// Mounted at /api/app/weather (routes/app.routes.js)
const router = Router();

router.use(responseStyle("flag"));

router.get("/farm/:farm_id", authenticateApp, appWeatherController.getWeatherByFarmId);
router.post("/get", authenticateApp, validate(weatherByCoordinatesSchema), appWeatherController.getWeatherByCoordinates);
// public (no login)
router.get("/public/farm/:farm_id", appWeatherController.getWeatherByFarmId);
router.post("/public/get", validate(weatherByCoordinatesSchema), appWeatherController.getWeatherByCoordinates);
// storing weather data in MongoDB
router.post("/store-daily", authenticateApp, validate(storeDailyWeatherSchema), appWeatherController.storeDailyUserWeather);
router.post("/public/store-daily", validate(storeDailyWeatherSchema), appWeatherController.storeDailyUserWeather); // daily cron job

export default router;
