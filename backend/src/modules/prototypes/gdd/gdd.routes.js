import { Router } from "express";
import axios from "axios";
import { env } from "../../../config/env.js";
import { isMongoConnected } from "../../../db/mongo.js";
import { GDD, Weather } from "./gdd.models.js";

const router = Router();

const FORECAST_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong";
// Farmonaut field the forecast is requested against (any valid field id works for lat/long forecasts)
const FIELD_ID = process.env.GDD_FIELD_ID || "1718712746745";

// POST /transform — fetch a Farmonaut forecast and compute total growing degree days
router.post("/transform", async (req, res) => {
  try {
    const { cropName, Latitude, Longitude, T_Base } = req.body ?? {};

    if (!Latitude || !Longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const response = await axios.post(
      FORECAST_URL,
      { FieldID: FIELD_ID, Latitude: String(Latitude), Longitude: String(Longitude) },
      {
        headers: {
          Authorization: `Bearer ${env.farmonautApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    let totalGDD = 0;
    for (const day of response.data.daily) {
      const tMaxC = day.temp.max - 273.15;
      const tMinC = day.temp.min - 273.15;
      totalGDD += Math.max((tMaxC + tMinC) / 2 - T_Base, 0); // GDD cannot be negative
    }

    // Persisting to MongoDB is optional: the calculation still works without it.
    if (isMongoConnected()) {
      await GDD.create({ cropName, T_Base, GDD: totalGDD });
      await Weather.create({
        cropName,
        Latitude: String(Latitude),
        Longitude: String(Longitude),
        T_Base,
        forecast: response.data,
      });
    }

    res.json({ forecast: response.data, GDD: totalGDD });
  } catch (err) {
    console.error("GDD transform error:", err.response?.data || err.message);
    res.status(500).json({ error: "Proxy error" });
  }
});

export default router;
