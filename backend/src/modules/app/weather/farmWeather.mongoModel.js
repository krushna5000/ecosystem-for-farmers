import mongoose from "mongoose";

const UserWeatherSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number, // matches your SQL user id
      required: true,
      index: true,
    },

    created_at: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    farmsWithWeather: {
      type: Array, // store combined farms + weather as-is
      required: true,
    },
  },
  {
    timestamps: false, // you already manage created_at
  }
);

// 🔒 One record per user per day
UserWeatherSchema.index({ user_id: 1, created_at: 1 }, { unique: true });

export default mongoose.model("UserWeather", UserWeatherSchema);
