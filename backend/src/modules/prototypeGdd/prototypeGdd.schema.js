import mongoose from "mongoose";

// MongoDB collections used by the GDD prototype (optional — needs MONGO_URI).
const GDDSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    T_Base: { type: String, required: true },
    GDD: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "gddData" },
);

const WeatherSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    Latitude: { type: String, required: true },
    Longitude: { type: String, required: true },
    T_Base: { type: String, required: true },
    forecast: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "weatherData" },
);

export const GDD = mongoose.models.gdd || mongoose.model("gdd", GDDSchema);
export const Weather = mongoose.models.Weather || mongoose.model("Weather", WeatherSchema);
