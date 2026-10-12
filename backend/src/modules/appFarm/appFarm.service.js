// Business rules + outbound integrations (Farmonaut, Open-Meteo, Nominatim) for farms and farm crops.
// Throws AppError subclasses; never touches req/res or db directly.
import axios from "axios";
import { env } from "../../config/env.js";
import { connectMongo } from "../../db/mongo.js";
import {
  createFarmInDB,
  listFarmsByUserInDB,
  getFarmByIdInDB,
  listAllFarmsInDB,
  updateFarmInDB,
  deleteFarmInDB,
  createFarmCropInDB,
  listFarmCropsByFarmInDB,
  getFarmCropByIdInDB,
  updateFarmCropInDB,
  deleteFarmCropInDB,
  listActivePincodesInDB,
  listFarmCropsByUserInDB,
  listAllCropsInDB,
  createFarmHistoricalWeatherInDB,
} from "./appFarm.factory.js";
import { AppError, BadRequestError, NotFoundError } from "../../errors/index.js";
import { upstream } from "../../utils/appUpstream.js";

const FARMONAUT_URL = "https://us-central1-farmbase-b2f7e.cloudfunctions.net";
const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

const farmonautHeaders = () => ({
  Authorization: `Bearer ${env.farmonautApiKey}`,
  "Content-Type": "application/json",
});

/* ------------------------------ farms ------------------------------ */

export async function addFarm({ user_id, farm_name, pincode_id, farm_coordinates }) {
  const response = await upstream(
    axios.post(
      `${FARMONAUT_URL}/submitField`,
      {
        CropCode: "2",
        FieldName: farm_name,
        PaymentType: 1,
        SowingDate: Math.floor(Date.now() / 1000).toString(),
        Points: farm_coordinates,
      },
      { headers: farmonautHeaders() },
    ),
  );

  const fieldId = response.data.FieldID;

  if (!fieldId) {
    throw new BadRequestError("fieldId is required", {
      body: { success: false, field: "fieldId", message: "fieldId is required" },
    });
  }

  return createFarmInDB(user_id, farm_name, pincode_id, JSON.stringify(farm_coordinates), fieldId);
}

/** Saves a farm that already has its Farmonaut field id (used by the WhatsApp flow). */
export function createFarm(userId, farmName, pincodeId, farmCoordinates, fieldId) {
  return createFarmInDB(userId, farmName, pincodeId, JSON.stringify(farmCoordinates), fieldId);
}

export function listFarmsByUser(userId) {
  return listFarmsByUserInDB(userId);
}

export async function getFarmById(farmId) {
  const farm = await getFarmByIdInDB(farmId);
  if (!farm) throw new NotFoundError("Farm not found");
  return farm;
}

/** Every farm — the daily weather cron walks all of them. */
export function listAllFarms() {
  return listAllFarmsInDB();
}

export async function updateFarm(farmId, { farm_name, pincode_id, farm_coordinates }) {
  const farm = await updateFarmInDB(farmId, farm_name, pincode_id, farm_coordinates);
  if (!farm) throw new NotFoundError("Farm not found");
  return farm;
}

export async function deleteFarm(farmId) {
  const farm = await getFarmByIdInDB(farmId);
  if (!farm) throw new NotFoundError("Farm not found");

  if (farm.field_id) {
    try {
      await axios.delete(`${FARMONAUT_URL}/deleteField`, {
        data: { FieldID: farm.field_id },
        headers: farmonautHeaders(),
      });
    } catch (error) {
      // Farmonaut failed: keep the local farm so both sides stay in sync
      if (error.response || error.request) {
        console.error("Error in deleteFarm:", error);
        const message = "Failed to delete farm from Farmonaut. Local deletion aborted.";
        throw new AppError(message, 500, { body: { success: false, message } });
      }
      throw error;
    }
  }

  const deleted = await deleteFarmInDB(farmId);
  if (!deleted) throw new NotFoundError("Farm not found");
}

/* ----------------------------- farm crops ----------------------------- */

// Safely extracts latitude / longitude from a farm's stored coordinates (array, JSON string, {lat,lng} points).
const extractLatLngFromFarmCoordinates = (farmCoordinates) => {
  let coords = farmCoordinates;

  if (!coords) {
    return { latitude: null, longitude: null };
  }

  if (typeof coords === "string") {
    coords = coords.trim();

    // If invalid JSON because of extra characters, try first JSON-looking part
    const firstBracket = coords.indexOf("[");
    const lastBracket = coords.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1) {
      coords = coords.slice(firstBracket, lastBracket + 1);
    }

    coords = JSON.parse(coords);
  }

  if (!Array.isArray(coords) || coords.length === 0) {
    return { latitude: null, longitude: null };
  }

  const firstPoint = coords[0];

  // Case 1: [[lat, lng], ...]
  if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
    return {
      latitude: Number(firstPoint[1]),
      longitude: Number(firstPoint[0]),
    };
  }

  // Case 2: [{ lat, lng }, ...]
  if (typeof firstPoint === "object" && firstPoint !== null) {
    const latitude = Number(firstPoint.lat ?? firstPoint.latitude ?? null);
    const longitude = Number(firstPoint.lng ?? firstPoint.lon ?? firstPoint.longitude ?? null);

    return { latitude, longitude };
  }

  return { latitude: null, longitude: null };
};

// Best effort: a failure here is reported in `weatherMessage`, it never fails the request.
async function storeHistoricalWeather({ farm_id, crop_id, sowing_date, sowDate }) {
  await connectMongo();

  const farm = await getFarmByIdInDB(farm_id);

  if (!farm) {
    const weatherMessage = `Farm not found for farm_id: ${farm_id}`;
    console.warn(weatherMessage);
    return { weatherStored: false, weatherMessage };
  }

  let weatherMessage;
  let latitude = null;
  let longitude = null;

  try {
    const parsed = extractLatLngFromFarmCoordinates(farm.farm_coordinates);
    latitude = parsed.latitude;
    longitude = parsed.longitude;
  } catch (parseErr) {
    weatherMessage = `Error parsing farm_coordinates: ${parseErr.message}`;
    console.error(weatherMessage);
  }

  if (latitude !== null && longitude !== null && !Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    try {
      // today in YYYY-MM-DD
      const todayStr = new Date().toISOString().split("T")[0];

      const weatherResponse = await axios.get(OPEN_METEO_ARCHIVE_URL, {
        params: {
          latitude,
          longitude,
          start_date: sowing_date,
          end_date: todayStr,
          hourly: "temperature_2m,precipitation,relative_humidity_2m,soil_temperature_0cm,windspeed_10m",
          timezone: "auto",
        },
      });

      await createFarmHistoricalWeatherInDB({
        farm_id: Number(farm_id),
        crop_id: Number(crop_id),
        sowing_date: sowDate,
        latitude,
        longitude,
        weather_data: weatherResponse.data,
      });

      return { weatherStored: true, weatherMessage: "Historical weather stored successfully" };
    } catch (weatherErr) {
      weatherMessage = `Open-Meteo API/storage error: ${weatherErr.message}`;
      console.error(weatherMessage);
    }
  } else {
    weatherMessage = `No valid coordinates found for farm ${farm_id}`;
    console.warn(weatherMessage);
  }

  return { weatherStored: false, weatherMessage };
}

export async function addFarmCrop({ farm_id, crop_id, sowing_date }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sowDate = new Date(`${sowing_date}T00:00:00`);
  sowDate.setHours(0, 0, 0, 0);

  let weather = {
    weatherStored: false,
    weatherMessage: "Sowing date is today or future, weather API skipped",
  };

  // A crop sown in the past gets its weather history since sowing stored for the agronomy engine
  if (sowDate < today) {
    weather = await storeHistoricalWeather({ farm_id, crop_id, sowing_date, sowDate });
  }

  const data = await createFarmCropInDB(farm_id, crop_id, sowing_date);

  return { data, ...weather };
}

export function listFarmCropsByFarm(farmId) {
  return listFarmCropsByFarmInDB(farmId);
}

export async function getFarmCropById(id) {
  const farmCrop = await getFarmCropByIdInDB(id);
  if (!farmCrop) throw new NotFoundError("Farm crop not found");
  return farmCrop;
}

export async function updateFarmCrop(id, { sowing_date }) {
  const farmCrop = await updateFarmCropInDB(id, sowing_date);
  if (!farmCrop) throw new NotFoundError("Farm crop not found");
  return farmCrop;
}

export async function deleteFarmCrop(id) {
  const farmCrop = await deleteFarmCropInDB(id);
  if (!farmCrop) throw new NotFoundError("Farm crop not found");
}

export function listFarmCropsByUser(userId) {
  return listFarmCropsByUserInDB(userId);
}

/* ------------------------------ lookups ------------------------------ */

export function listPincodes() {
  return listActivePincodesInDB();
}

export function listCrops() {
  return listAllCropsInDB();
}

/** Boundary polygon (or just a centre point) for a pincode, from OpenStreetMap Nominatim. `null` when unknown. */
export async function getPincodeBoundary(pincode) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&polygon_geojson=1`,
      {
        headers: {
          "User-Agent": "farm-app",
        },
      },
    );

    const data = await response.json();

    if (!data.length) return null;

    const placeWithPolygon = data.find((item) => item.geojson && item.geojson.type === "Polygon");

    const place = placeWithPolygon || data[0];

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (place.geojson && place.geojson.type === "Polygon") {
      return {
        kind: "geojson",
        geometry: place.geojson,
        center: [lat, lon],
      };
    }

    // fallback (Point or no geometry)
    return {
      kind: "buffer",
      center: [lat, lon],
    };
  } catch (err) {
    console.error("Pincode boundary error:", err);
    // this endpoint has always answered `{ error }`, not `{ success, message }`
    throw new AppError("Failed to fetch boundary", 500, { body: { error: "Failed to fetch boundary" } });
  }
}
