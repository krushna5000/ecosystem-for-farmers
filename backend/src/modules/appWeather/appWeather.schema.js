// Mongoose models for weather data (Mongo-backed): one daily snapshot per user, a read-side view of the same
// collection used by the agronomy engine, and the historical weather stored when a crop is sown in the past.
import mongoose from "mongoose";

// One record per user per day: all of a user's farms with their forecast, as returned by Farmonaut.
const UserWeatherSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number, // matches the SQL user id
      required: true,
      index: true,
    },

    created_at: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    farmsWithWeather: {
      type: Array, // combined farms + weather, stored as-is
      required: true,
    },
  },
  {
    timestamps: false, // created_at is managed by the writers
  },
);

// One record per user per day
UserWeatherSchema.index({ user_id: 1, created_at: 1 }, { unique: true });

export const UserWeather = mongoose.model("UserWeather", UserWeatherSchema);

// Loose view of the same `userweathers` collection, used by the agronomy engine.
const WeatherSchema = new mongoose.Schema({
  created_at: String, // YYYY-MM-DD
  user_id: Number,
  farmsWithWeather: Array,
});

export const Weather = mongoose.model("Weather", WeatherSchema, "userweathers");

const farmHistoricalWeatherSchema = new mongoose.Schema(
  {
    farm_id: {
      type: Number,
      required: true,
      index: true,
    },
    crop_id: {
      type: Number,
      required: true,
    },
    sowing_date: {
      type: Date,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    weather_data: {
      type: Object,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "farm_historical_weather",
  },
);

export const FarmHistoricalWeather =
  mongoose.models.FarmHistoricalWeather ||
  mongoose.model("FarmHistoricalWeather", farmHistoricalWeatherSchema);
