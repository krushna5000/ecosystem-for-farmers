// GDD prototype: fetches a Farmonaut forecast and computes the total growing degree days.
// Throws AppError subclasses; never touches req/res or the database directly.
import axios from "axios";
import {
  isGddStoreConnectedInDB,
  createGddResultInDB,
  createWeatherSnapshotInDB,
} from "./prototypeGdd.factory.js";
import { env } from "../../config/env.js";
import { AppError, BadRequestError } from "../../errors/index.js";

const FORECAST_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong";
// Farmonaut field the forecast is requested against (any valid field id works for lat/long forecasts)
const FIELD_ID = process.env.GDD_FIELD_ID || "1718712746745";

// This prototype answers `{ error }`, not the router's `{ success, message }` envelope.
const errorOptions = (message) => ({ body: { error: message } });

function totalGrowingDegreeDays(daily, tBase) {
  let totalGDD = 0;
  for (const day of daily) {
    const tMaxC = day.temp.max - 273.15;
    const tMinC = day.temp.min - 273.15;
    totalGDD += Math.max((tMaxC + tMinC) / 2 - tBase, 0); // GDD cannot be negative
  }
  return totalGDD;
}

/** @returns {Promise<{forecast: object, GDD: number}>} */
export async function calculateGdd({ cropName, Latitude, Longitude, T_Base }) {
  if (!Latitude || !Longitude) {
    throw new BadRequestError(
      "Latitude and Longitude are required",
      errorOptions("Latitude and Longitude are required"),
    );
  }

  try {
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

    const totalGDD = totalGrowingDegreeDays(response.data.daily, T_Base);

    // Persisting to MongoDB is optional: the calculation still works without it.
    if (isGddStoreConnectedInDB()) {
      await createGddResultInDB({ cropName, T_Base, totalGDD });
      await createWeatherSnapshotInDB({
        cropName,
        Latitude: String(Latitude),
        Longitude: String(Longitude),
        T_Base,
        forecast: response.data,
      });
    }

    return { forecast: response.data, GDD: totalGDD };
  } catch (err) {
    console.error("GDD transform error:", err.response?.data || err.message);
    throw new AppError("Proxy error", 500, errorOptions("Proxy error"));
  }
}
