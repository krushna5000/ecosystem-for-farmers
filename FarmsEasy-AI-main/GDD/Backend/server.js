import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import { Weather } from "./models/WeatherSchema.js";
import mongoose from "mongoose";
import { GDD } from "./models/GDDSchema.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const FIELD_ID = "1718712746745";
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/transform", async (req, res) => {
  try {
    const { cropName, Latitude, Longitude, T_Base } = req.body;

    if (!Latitude || !Longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and Longitude are required" });
    }

    const response = await axios.post(
      "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getForecastWeatherFromLatLong", // updated API endpoint
      {
        FieldID: FIELD_ID,
        Latitude: String(Latitude), // must be string
        Longitude: String(Longitude), // must be string
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const weatherData = response.data.daily; // your daily array
    let totalGDD = 0;

    weatherData.forEach((day) => {
      const T_max_C = day.temp.max - 273.15;
      const T_min_C = day.temp.min - 273.15;

      let dailyGDD = (T_max_C + T_min_C) / 2 - T_Base;

      if (dailyGDD < 0) dailyGDD = 0; // GDD cannot be negative

      totalGDD += dailyGDD;
    });

    console.log(totalGDD);

    const GDDDoc = new GDD({
      cropName,
      T_Base: T_Base,
      GDD: totalGDD,
    });

    await GDDDoc.save();

    console.log("GDD Stored");

    const weatherDoc = new Weather({
      cropName,
      Latitude: String(Latitude),
      Longitude: String(Longitude),
      T_Base: T_Base,
      forecast: response.data,
    });

    await weatherDoc.save();

    console.log("Weather data saved to MongoDB");
    res.json({ forecast: response.data, GDD: totalGDD });
  } catch (err) {
    console.error("Backend API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Proxy error" });
  }
});

app.listen(5000, () => console.log("Proxy running on port 5000"));
