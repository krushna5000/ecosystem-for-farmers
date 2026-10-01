import mongoose from "mongoose";
import UserWeather from "../mongoModels/FarmWeather.js";
import mongoSanitize from "express-mongo-sanitize";

export const storeDailyUserWeather = async (req, res) => {
  try {
    // Sanitize input
    mongoSanitize.sanitize(req.body);
    const { user_id, farmsWithWeather } = req.body;

    // Validate user_id
    if (!user_id || typeof user_id !== "string" || !user_id.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id",
      });
    }

    // Validate farmsWithWeather
    if (!Array.isArray(farmsWithWeather)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    // Day-level key
    const created_at = new Date().toISOString().split("T")[0];

    // Validate created_at (should be a valid date string)
    if (isNaN(Date.parse(created_at))) {
      return res.status(400).json({
        success: false,
        message: "Invalid created_at date",
      });
    }

    const doc = await UserWeather.findOneAndUpdate(
      { user_id, created_at },
      {
        user_id,
        created_at,
        farmsWithWeather,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Weather data stored successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Store Weather Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to store weather data",
    });
  }
};
