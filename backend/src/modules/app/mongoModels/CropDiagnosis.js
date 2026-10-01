import mongoose from "mongoose";

const CropDiagnosisSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
      index: true,
    },

    diagnosisData: {
      type: Object,
      required: true,
    },

    imageHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("CropDiagnosis", CropDiagnosisSchema);
