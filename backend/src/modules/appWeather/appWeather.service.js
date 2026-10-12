// Weather for farms and coordinates (Farmonaut forecast + an in-memory daily cache) and the stored daily
// snapshots. Throws AppError subclasses; never touches req/res or the database directly.
import axios from "axios";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "../../config/env.js";
import { upsertUserWeatherInDB, listUserWeatherInRangeInDB } from "./appWeather.factory.js";
import { BadRequestError } from "../../errors/index.js";
import { upstream } from "../../utils/appUpstream.js";
import { getFarmById } from "../appFarm/appFarm.service.js";

const FARMONAUT_WEATHER_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong";

const weatherCache = new Map();

const todayString = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const getTodayKey = (lat, lng) => `${lat}_${lng}_${todayString()}`;

const fetchForecast = (fieldId, latitude, longitude) =>
  upstream(
    axios.post(
      FARMONAUT_WEATHER_URL,
      {
        FieldID: fieldId,
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${env.farmonautApiKey}`,
          "Content-Type": "application/json",
        },
      },
    ),
  );

// Coordinates arrive as [[lng, lat], ...], [{lat, lng}, ...], {lat, lng} or {latitude, longitude}
const extractLatLng = (farmCoords) => {
  let latitude, longitude;

  if (Array.isArray(farmCoords) && farmCoords.length >= 1) {
    const firstPoint = farmCoords[0];

    // Format: [lng, lat] - simple array
    if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
      longitude = firstPoint[0];
      latitude = firstPoint[1];
    }
    // Format: {lat, lng} or {latitude, longitude}
    else if (firstPoint.lat && firstPoint.lng) {
      latitude = firstPoint.lat;
      longitude = firstPoint.lng;
    } else if (firstPoint.latitude && firstPoint.longitude) {
      latitude = firstPoint.latitude;
      longitude = firstPoint.longitude;
    }
  } else if (farmCoords && farmCoords.lat && farmCoords.lng) {
    latitude = farmCoords.lat;
    longitude = farmCoords.lng;
  } else if (farmCoords && farmCoords.latitude && farmCoords.longitude) {
    latitude = farmCoords.latitude;
    longitude = farmCoords.longitude;
  }

  return { latitude, longitude };
};

/** Forecast for a stored farm (404 when the farm is unknown). */
export async function getWeatherByFarmId(farmId) {
  const farm = await getFarmById(farmId);

  const { latitude, longitude } = extractLatLng(farm.farm_coordinates);

  if (!latitude || !longitude) {
    throw new BadRequestError("Farm latitude and longitude are required");
  }

  const weatherResponse = await fetchForecast(farmId, latitude, longitude);

  return { farm, weather: weatherResponse.data };
}

/**
 * Forecast for coordinates, cached per coordinates per day. A cache hit returns the cached object;
 * a fresh fetch returns the forecast as a pretty-printed JSON string (the wire format clients already parse).
 */
export async function getWeatherByCoordinates({ latitude, longitude, field_id }) {
  const cacheKey = getTodayKey(latitude, longitude);

  // RETURN CACHED RESPONSE (NO API HIT)
  if (weatherCache.has(cacheKey)) {
    return { weather: weatherCache.get(cacheKey), cached: true };
  }

  const weatherResponse = await fetchForecast(field_id, latitude, longitude);

  const weatherData = weatherResponse.data;

  // Store in cache
  weatherCache.set(cacheKey, weatherData);

  return { weather: JSON.stringify(weatherResponse.data, null, 2), cached: false };
}

/** Stores (or replaces) today's weather snapshot for one user. */
export function storeDailyUserWeather({ user_id, farmsWithWeather }) {
  // Protect against NoSQL injection: strip `$` / `.` keys from the payload before it reaches Mongo
  mongoSanitize.sanitize(farmsWithWeather);

  // Day-level key
  return upsertUserWeatherInDB(user_id, todayString(), farmsWithWeather);
}

/** Same upsert for callers that already know the day (the daily cron). */
export function upsertDailyUserWeather(userId, createdAt, farmsWithWeather) {
  return upsertUserWeatherInDB(userId, createdAt, farmsWithWeather);
}

/** A user's stored daily snapshots between two dates (YYYY-MM-DD), oldest first. */
export function listUserWeatherInRange(userId, from, to) {
  return listUserWeatherInRangeInDB(userId, from, to);
}
