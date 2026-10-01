import mongoose from "mongoose";

const DiseaseRiskSchema = new mongoose.Schema({
  stage: String,
  das_min: Number,
  das_max: Number,
  gdd_min: Number,
  gdd_max: Number,
  disease_name: String,
});

const DiseaseSchema = new mongoose.Schema({
  crop: String,
  disease_risk: [DiseaseRiskSchema],
});

export default mongoose.model("Disease", DiseaseSchema, "CropDiseaseDataSet");
