import mongoose from "mongoose";

const WeatherSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    Latitude: { type: String, required: true },
    Longitude: { type: String, required: true },
    T_Base: { type: String, require: true },
    forecast: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "weatherData" }
);

export const Weather = mongoose.model("Weather", WeatherSchema);
