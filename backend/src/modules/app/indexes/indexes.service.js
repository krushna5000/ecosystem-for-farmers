import axios from "axios";
import FieldIndex from "./fieldIndex.mongoModel.js";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";
import { env } from "../../../config/env.js";

const FARMONAUT_URL =
  "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getAllIndexValues";

export const fetchAndStoreIndexesService = async (fieldId) => {
  // Sanitize and validate fieldId
  mongoSanitize.sanitize(fieldId);
  if (!fieldId || (typeof fieldId !== "string" && !mongoose.Types.ObjectId.isValid(fieldId))) {
    throw new Error("Invalid fieldId");
  }

  const response = await axios.post(
    FARMONAUT_URL,
    { FieldID: fieldId },
    {
      headers: {
        Authorization: `Bearer ${env.farmonautApiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = response.data;

  const indices = {
    NDVI: raw?.ndvi,
    NDRE: raw?.ndre,
    EVI: raw?.evi,
    SAVI: raw?.savi,

    NDMI: raw?.ndmi,
    NDWI: raw?.ndwi,
    RSM: raw?.rsm,

    SOC: raw?.soc,
    BSI: raw?.bsi,
    SI: raw?.si,
  };

  const date = new Date().toISOString().split("T")[0];

  const savedRecord = await FieldIndex.findOneAndUpdate(
    { fieldId },
    {
      fieldId,
      date,
      indices,
    },
    { upsert: true, new: true },
  );

  return {
    fieldId,
    date,
    indices: savedRecord.indices,
  };
};
