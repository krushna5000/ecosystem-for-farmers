import axios from "axios";
import { env } from "../../../config/env.js";
import { getFarmById } from "../models/farmModel.js";

const FARMONAUT_WEATHER_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong";

const weatherCache = new Map();

const getTodayKey = (lat, lng) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `${lat}_${lng}_${today}`;
};

// Function to get weather by farm ID
const getWeatherByFarmId = async (req, res) => {
  try {
    const { farm_id } = req.params;

    // Fetch farm data from database
    const farm = await getFarmById(farm_id);
    if (!farm) {
      return res
        .status(404)
        .json({ success: false, message: "Farm not found" });
    }

    // Validate latitude and longitude
    const farmCoords = farm.farm_coordinates;
    let latitude, longitude;
    
    // Handle different coordinate formats
    // Format: [[lng, lat], [lng, lat], ...] or [lat, lng] or [{lat, lng}]
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
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Farm latitude and longitude are required",
      });
    }

    // Call external weather API
    const weatherResponse = await axios.post(
      FARMONAUT_WEATHER_URL,
      {
        FieldID: farm_id,
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${env.farmonautApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return response
    res.status(200).json({
      success: true,
      farm: farm,
      weather: weatherResponse.data,
    });
  } catch (error) {
    console.error("Error fetching weather by farm ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Function to get weather by coordinates
const getWeatherByCoordinates = async (req, res) => {
  try {
    const { latitude, longitude, field_id } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const cacheKey = getTodayKey(latitude, longitude);

    // RETURN CACHED RESPONSE (NO API HIT)
    if (weatherCache.has(cacheKey)) {
      return res.status(200).json({
        success: true,
        weather: weatherCache.get(cacheKey),
        cached: true,
      });
    }

    // Call external weather API
    const weatherResponse = await axios.post(
      FARMONAUT_WEATHER_URL,
      {
        FieldID: field_id, // For coordinates endpoint, use a default FieldID
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${env.farmonautApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const weatherData = weatherResponse.data;

    // Store in cache
    weatherCache.set(cacheKey, weatherData);

    // Return response
    res.status(200).json({
      success: true,
      weather: JSON.stringify(weatherResponse.data, null, 2),
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching weather by coordinates:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getWeatherByFarmId, getWeatherByCoordinates };
