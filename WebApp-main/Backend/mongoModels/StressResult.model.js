import mongoose from "mongoose";

const StressResultSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true },
    date: { type: String, required: true },

    vegetation_stress_score: Number, // 0–1
    water_stress_score: Number,      // 0–1
    soil_stress_score: Number,       // 0–1

    final_stress_percent: Number     // 0–100
  },
  { timestamps: true }
);

export default mongoose.model("StressResult", StressResultSchema);
