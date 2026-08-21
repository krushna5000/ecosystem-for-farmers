import mongoose from "mongoose";

const WeatherSchema = new mongoose.Schema({
  created_at: String, // YYYY-MM-DD
  user_id: Number,
  farmsWithWeather: Array,
});

export default mongoose.model("Weather", WeatherSchema, "userweathers");
