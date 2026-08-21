import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    is_completed: { type: Boolean, default: false },
    completed_at: Date,
  },
  { _id: false }
);

const diseaseRiskSchema = new mongoose.Schema(
  {
    disease_name: { type: String, required: true },
    risk: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH"],
      required: true,
    },
  },
  { _id: false }
);

const farmCropLifecycleSchema = new mongoose.Schema(
  {
    field_id: { type: Number, required: true, index: true },
    farm_id: { type: Number, required: true, index: true },
    crop_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    crop: { type: String, required: true },

    stages: { type: [stageSchema], required: true },

    current_stage: { type: String, required: true },
    upcoming_stage: { type: String, default: null },

    clcm_status: {
      das: Number,
      cumulative_gdd: Number,
      stage_confidence: Number,
      expected_days_to_next_stage: String,

      disease_risk: {
        type: String,
        enum: ["LOW", "MODERATE", "HIGH"],
      },

      probable_disease_types: {
        type: [diseaseRiskSchema],
        default: [],
      },

      summary: String,

      transition: {
        from: String,
        to: String,
        progress: Number,
        phase: String,
      },

      last_updated_at: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

farmCropLifecycleSchema.index({ farm_id: 1, crop_id: 1 }, { unique: true });

export default mongoose.model("FarmCropLifecycle", farmCropLifecycleSchema);
