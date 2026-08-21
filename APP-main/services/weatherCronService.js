import cron from "node-cron";
import axios from "axios";
import { getAllFarms } from "../models/farmModel.js";
import UserWeather from "../mongoModels/FarmWeather.js";

const FARMONAUT_WEATHER_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong";
// Function to fetch weather for a single farm
const fetchWeatherForFarm = async (farm) => {
  try {
    const farmCoords = farm.farm_coordinates;
    let latitude, longitude;
    
    // Handle coordinate format: [[lng, lat], ...]
    if (Array.isArray(farmCoords) && farmCoords.length >= 1) {
      const firstPoint = farmCoords[0];
      if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
        longitude = firstPoint[0];
        latitude = firstPoint[1];
      }
    }

    if (!latitude || !longitude) {
      console.log(`Farm ${farm.id} - No valid coordinates found`);
      return null;
    }

    const response = await axios.post(
      FARMONAUT_WEATHER_URL,
      {
        FieldID: farm.field_id || farm.id.toString(),
        Latitude: latitude.toString(),
        Longitude: longitude.toString(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FARMONAUT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      farm_id: farm.id,
      farm_name: farm.farm_name,
      user_id: farm.user_id,
      weather: response.data,
    };
  } catch (error) {
    console.error(`Error fetching weather for farm ${farm.id}:`, error.message);
    return null;
  }
};

// Main function to fetch weather for all farms and store in MongoDB
const fetchWeatherForAllFarms = async () => {
  try {
    console.log("Starting daily weather fetch for all farms...");

    // Get all farms
    const farms = await getAllFarms();
    console.log(`Found ${farms.length} farms`);

    // Group farms by user_id
    const userWeatherMap = new Map();

    // Process farms in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < farms.length; i += batchSize) {
      const batch = farms.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(fetchWeatherForFarm));

      // Group results by user_id
      for (const result of results) {
        if (result) {
          const userId = result.user_id;
          if (!userWeatherMap.has(userId)) {
            userWeatherMap.set(userId, []);
          }
          userWeatherMap.get(userId).push(result);
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < farms.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Store weather data for each user
    const created_at = new Date().toISOString().split("T")[0];

    for (const [userId, farmsWithWeather] of userWeatherMap) {
      try {
        await UserWeather.findOneAndUpdate(
          { user_id: userId, created_at },
          {
            user_id: userId,
            created_at,
            farmsWithWeather,
          },
          { upsert: true, new: true }
        );
        console.log(`Stored weather for user ${userId} - ${farmsWithWeather.length} farms`);
      } catch (error) {
        console.error(`Error storing weather for user ${userId}:`, error.message);
      }
    }

    console.log("Daily weather fetch completed successfully!");
  } catch (error) {
    console.error("Error in daily weather fetch:", error.message);
  }
};

// Schedule: Run at 6:00 AM every day
// Cron expression: "0 6 * * *" = second 0, minute 6, every hour, every day, every month
const startWeatherCron = () => {
  console.log("Weather cron job scheduled - running at 6:00 AM daily");

  // Run immediately on startup (optional - for testing)
  // fetchWeatherForAllFarms();

  // Schedule for 6:00 AM daily
  cron.schedule("0 6 * * *", () => {
    console.log("Running scheduled daily weather fetch...");
    fetchWeatherForAllFarms();
  });
};

export { startWeatherCron, fetchWeatherForAllFarms };