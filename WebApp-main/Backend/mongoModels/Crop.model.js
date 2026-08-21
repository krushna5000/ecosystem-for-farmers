import mongoose from "mongoose";

const GrowthStageSchema = new mongoose.Schema({
  stage: String,
  das_min: Number,
  das_max: Number,
  gdd_min: Number,
  gdd_max: Number,
});

const CropSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  base_temperature_c: Number,
  growth_stages: [GrowthStageSchema],
});

export default mongoose.model("Crop", CropSchema, "Crops");
