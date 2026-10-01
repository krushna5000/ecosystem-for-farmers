import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { parseMultipart } from "../middleware/formidableParser.js";

import {
  getWeatherByFarmId,
  getWeatherByCoordinates,
} from "../controllers/weatherController.js";
import { storeDailyUserWeather } from "../mongoControllers/storeDailyUserWeather.js";
import analyzeCrop from "../controllers/cropController.js";
import analyzeWhatsappCrop from "../controllers/whatsapp/cropController.js";
import { agronomyInference } from "../mongoControllers/agronomy.controller.js";
import { getAllCrops } from "../mongoControllers/crop.controller.js";
import cropAdvisory from "../mongoControllers/cropAdvisory.controller.js";
import { fetchAndStoreIndexes } from "../controllers/indexesController.js";
import { calculateStress } from "../controllers/stressController.js";

const router = Router();

// /weather
const weather = Router();
weather.get("/farm/:farm_id", authMiddleware, getWeatherByFarmId);
weather.post("/get", authMiddleware, getWeatherByCoordinates);
// public (no login)
weather.get("/public/farm/:farm_id", getWeatherByFarmId);
weather.post("/public/get", getWeatherByCoordinates);
// storing weather data in MongoDB
weather.post("/store-daily", authMiddleware, storeDailyUserWeather);
weather.post("/public/store-daily", storeDailyUserWeather); // daily cron job
router.use("/weather", weather);

// /whatsapp (crop analysis for the WhatsApp bot)
const whatsapp = Router();
whatsapp.post("/analyze-crop", parseMultipart, analyzeWhatsappCrop);
router.use("/whatsapp", whatsapp);

// /crop-ai
const cropAi = Router();
cropAi.post("/analyze-crop", authMiddleware, parseMultipart, analyzeCrop);
router.use("/crop-ai", cropAi);

// /CLSM (crop lifecycle stage model)
const clsm = Router();
clsm.post("/infer", agronomyInference);
clsm.get("/get-all-crops", getAllCrops);
router.use("/CLSM", clsm);

// /crop-advisory
const advisory = Router();
advisory.get("/", cropAdvisory);
router.use("/crop-advisory", advisory);

// un-prefixed (old `app.use("/api", ...)`)
router.post("/indexes/:fieldId", fetchAndStoreIndexes);
router.get("/stress/:fieldId/:date", calculateStress);

export default router;
