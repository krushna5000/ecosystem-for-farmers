import { Router } from "express";
import { getWeatherByFarmId, getWeatherByCoordinates } from "./weather.controller.js";
import { storeDailyUserWeather } from "./storeDailyUserWeather.controller.js";
import authMiddleware from "../../../middleware/app/authMiddleware.js";

// Mounted at /weather
const router = Router();

router.get("/farm/:farm_id", authMiddleware, getWeatherByFarmId);
router.post("/get", authMiddleware, getWeatherByCoordinates);
// public (no login)
router.get("/public/farm/:farm_id", getWeatherByFarmId);
router.post("/public/get", getWeatherByCoordinates);
// storing weather data in MongoDB
router.post("/store-daily", authMiddleware, storeDailyUserWeather);
router.post("/public/store-daily", storeDailyUserWeather); // daily cron job

export default router;
