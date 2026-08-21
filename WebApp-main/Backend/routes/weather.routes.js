import express from "express";
import {
  getWeatherByFarmId,
  getWeatherByCoordinates,
} from "../controllers/weatherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { storeDailyUserWeather } from "../mongoControllers/storeDailyUserWeather.js";

const router = express.Router();

// Weather APIs (requires login)
router.get("/farm/:farm_id", authMiddleware, getWeatherByFarmId);
router.post("/get", authMiddleware, getWeatherByCoordinates);

// Public Weather APIs (no login required)
router.get("/public/farm/:farm_id", getWeatherByFarmId);
router.post("/public/get", getWeatherByCoordinates);

// storing weather data in mongoDB
router.post("/store-daily", authMiddleware, storeDailyUserWeather);

// Public endpoint for daily cron job (no login required)
router.post("/public/store-daily", storeDailyUserWeather);

export default router;
