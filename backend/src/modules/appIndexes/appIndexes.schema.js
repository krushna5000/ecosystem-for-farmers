// Mongoose model for satellite vegetation/water/soil index series per Farmonaut field (Mongo-backed).
import mongoose from "mongoose";

const fieldIndexesSchema = new mongoose.Schema(
  {
    fieldId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    indices: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false },
);

export const FieldIndex = mongoose.model("FieldIndexes", fieldIndexesSchema);
