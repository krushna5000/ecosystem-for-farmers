import mongoose from "mongoose";

const GDDSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    T_Base: { type: String, required: true },
    GDD: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "gddData" }
);

export const GDD = mongoose.model("gdd", GDDSchema);
