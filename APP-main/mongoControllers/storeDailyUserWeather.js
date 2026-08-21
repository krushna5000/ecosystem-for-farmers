import mongoose from "mongoose";
import UserWeather from "../mongoModels/FarmWeather.js";

export const storeDailyUserWeather = async (req, res) => {
  try {
    const { user_id, farmsWithWeather } = req.body;

    if (!user_id || !Array.isArray(farmsWithWeather)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    // Day-level key
    const created_at = new Date().toISOString().split("T")[0];

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
