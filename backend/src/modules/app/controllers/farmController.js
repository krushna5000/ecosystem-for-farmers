import {
  addFarm as addFarmModel,
  getFarmsByUser as getFarmsByUserModel,
  getFarmById as getFarmByIdModel,
  updateFarm as updateFarmModel,
  deleteFarm as deleteFarmModel,
  addFarmCrop as addFarmCropModel,
  getFarmCropsByFarm as getFarmCropsByFarmModel,
  getFarmCropById as getFarmCropByIdModel,
  updateFarmCrop as updateFarmCropModel,
  deleteFarmCrop as deleteFarmCropModel,
  getAllActivePincodes,
  getFarmCropsByUser as getFarmCropsByUserModel,
  getAllCrops as getAllCropsModel,
  updateFarmFieldId,
} from "../models/farmModel.js";
import axios from "axios";
import { env } from "../../../config/env.js";
import { connectMongo } from "../../../db/mongo.js";
import FarmHistoricalWeather from "../mongoModels/FarmHistoricalWeather.js";

// Farm APIs
const addFarm = async (req, res) => {
  try {
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
      return res.status(400).json({
        success: false,
        message: "user_id, farm_name pincode_id and coordinates are required",
      });
    }

    if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: "At least 3 boundary points required",
      });
    }

    const response = await axios.post(
      "https://us-central1-farmbase-b2f7e.cloudfunctions.net/submitField",
      {
        CropCode: "2",
        FieldName: farm_name,
        PaymentType: 1,
        SowingDate: Math.floor(Date.now() / 1000).toString(),
        Points: farm_coordinates,
      },
      {
        headers: {
          Authorization: `Bearer ${env.farmonautApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const fieldId = response.data.FieldID;

    if (fieldId) {
      const data = await addFarmModel(
        user_id,
        farm_name,
        pincode_id,
        JSON.stringify(farm_coordinates),
        fieldId
      );

      return res.status(201).json({
        success: true,
        message: "Farm added successfully",
        data,
      });
    }

    return res.status(400).json({
      success: false,
      field: "fieldId",
      message: "fieldId is required",
    });
  } catch (error) {
    console.error("Error in addFarm:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const data = await getFarmsByUserModel(user_id);

    return res.status(200).json({
      success: true,
      message: "Farms retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmsByUser:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmById = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await getFarmByIdModel(farm_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmById:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;
    const { farm_name, pincode_id, farm_coordinates } = req.body;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await updateFarmModel(
      farm_id,
      farm_name,
      pincode_id,
      farm_coordinates
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in updateFarm:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const farmData = await getFarmByIdModel(farm_id);

    if (!farmData) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    if (farmData.field_id) {
      await axios.delete(
        "https://us-central1-farmbase-b2f7e.cloudfunctions.net/deleteField",
        {
          data: {
            FieldID: farmData.field_id,
          },
          headers: {
            Authorization: `Bearer ${env.farmonautApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await deleteFarmModel(farm_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFarm:", error);

    if (error.response || error.request) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete farm from Farmonaut. Local deletion aborted.",
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// helper: safely extract latitude and longitude
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
    const latitude = Number(
      firstPoint.lat ?? firstPoint.latitude ?? null
    );
    const longitude = Number(
      firstPoint.lng ?? firstPoint.lon ?? firstPoint.longitude ?? null
    );

    return { latitude, longitude };
  }

  return { latitude: null, longitude: null };
};

// Farm Crop APIs
const addFarmCrop = async (req, res) => {
  try {
    const { farm_id, crop_id, sowing_date } = req.body;

    if (!farm_id || !crop_id || !sowing_date) {
      return res.status(400).json({
        success: false,
        message: "farm_id, crop_id and sowing_date are required",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sowing_date)) {
      return res.status(400).json({
        success: false,
        message: "sowing_date must be in YYYY-MM-DD format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sowDate = new Date(`${sowing_date}T00:00:00`);
    sowDate.setHours(0, 0, 0, 0);

    let weatherStored = false;
    let weatherMessage = "Historical weather logic not triggered";

    if (sowDate < today) {
      await connectMongo();

      const farm = await getFarmByIdModel(farm_id);

      if (!farm) {
        weatherMessage = `Farm not found for farm_id: ${farm_id}`;
        console.warn(weatherMessage);
      } else {
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

        if (
          latitude !== null &&
          longitude !== null &&
          !Number.isNaN(latitude) &&
          !Number.isNaN(longitude)
        ) {
          try {
            // today in YYYY-MM-DD
            const todayStr = new Date().toISOString().split("T")[0];

            const weatherResponse = await axios.get(
              "https://archive-api.open-meteo.com/v1/archive",
              {
                params: {
                  latitude,
                  longitude,
                  start_date: sowing_date,
                  end_date: todayStr,
                  hourly:
                    "temperature_2m,precipitation,relative_humidity_2m,soil_temperature_0cm,windspeed_10m",
                  timezone: "auto",
                },
              }
            );

            const weatherData = weatherResponse.data;

            await FarmHistoricalWeather.create({
              farm_id: Number(farm_id),
              crop_id: Number(crop_id),
              sowing_date: sowDate,
              latitude,
              longitude,
              weather_data: weatherData,
            });

            weatherStored = true;
            weatherMessage = "Historical weather stored successfully";
          } catch (weatherErr) {
            weatherMessage = `Open-Meteo API/storage error: ${weatherErr.message}`;
            console.error(weatherMessage);
          }
        } else {
          weatherMessage = `No valid coordinates found for farm ${farm_id}`;
          console.warn(weatherMessage);
        }
      }
    } else {
      weatherMessage = "Sowing date is today or future, weather API skipped";
    }

    const data = await addFarmCropModel(farm_id, crop_id, sowing_date);

    return res.status(201).json({
      success: true,
      message: "Farm crop added successfully",
      data,
      weatherStored,
      weatherMessage,
    });
  } catch (error) {
    console.error("Error in addFarmCrop:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getFarmCropsByFarm = async (req, res) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      return res.status(400).json({
        success: false,
        message: "farm_id is required",
      });
    }

    const data = await getFarmCropsByFarmModel(farm_id);

    return res.status(200).json({
      success: true,
      message: "Farm crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropsByFarm:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmCropById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await getFarmCropByIdModel(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm crop retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropById:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFarmCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { sowing_date } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await updateFarmCropModel(id, sowing_date);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm crop updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error in updateFarmCrop:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFarmCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const data = await deleteFarmCropModel(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Farm crop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Farm crop deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFarmCrop:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPincodes = async (req, res) => {
  try {
    const pincodes = await getAllActivePincodes();
    return res.json({ success: true, pincodes });
  } catch (error) {
    console.error("Error in getAllPincodes:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFarmCropsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const data = await getFarmCropsByUserModel(user_id);

    return res.status(200).json({
      success: true,
      message: "Farm crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getFarmCropsByUser:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCrops = async (req, res) => {
  try {
    const data = await getAllCropsModel();

    return res.status(200).json({
      success: true,
      message: "Crops retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in getAllCrops:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  addFarm,
  getFarmsByUser,
  getFarmById,
  updateFarm,
  deleteFarm,
  addFarmCrop,
  getFarmCropsByFarm,
  getFarmCropById,
  updateFarmCrop,
  deleteFarmCrop,
  getAllPincodes,
  getFarmCropsByUser,
  getAllCrops,
};