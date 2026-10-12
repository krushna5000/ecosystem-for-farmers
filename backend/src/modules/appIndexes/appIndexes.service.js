// Satellite index series from Farmonaut, passed through or mapped + stored per field.
// Throws AppError subclasses; never touches req/res or the database directly.
import axios from "axios";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { upsertFieldIndexInDB } from "./appIndexes.factory.js";
import { AppError, BadRequestError } from "../../errors/index.js";
import { upstream } from "../../utils/appUpstream.js";

const FARMONAUT_URL = "https://us-central1-farmbase-b2f7e.cloudfunctions.net/getAllIndexValues";

const fetchIndexValues = (fieldId) =>
  axios.post(
    FARMONAUT_URL,
    { FieldID: fieldId },
    {
      headers: {
        Authorization: `Bearer ${env.farmonautApiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

/** JUST FETCH: Farmonaut's index series for a field, keyed by date string (nothing is stored). */
export async function fetchFieldIndices(fieldId) {
  try {
    const response = await fetchIndexValues(fieldId);
    return { fieldId, indices: response.data };
  } catch (error) {
    // Farmonaut's own status is passed through, with its payload under `error`
    const statusCode = error.response?.status || 500;
    const message = "Failed to fetch data from Farmonaut";
    throw new AppError(message, statusCode, {
      body: { success: false, message, error: error.response?.data || error.message },
    });
  }
}

/** FETCH + MAP + STORE: the named indexes of a field are saved (one document per field) and returned. */
export async function fetchAndStoreIndexes(fieldId) {
  if (!fieldId || (typeof fieldId !== "string" && !mongoose.Types.ObjectId.isValid(fieldId))) {
    throw new BadRequestError("Invalid fieldId");
  }

  const response = await upstream(fetchIndexValues(fieldId));

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

  const savedRecord = await upsertFieldIndexInDB(fieldId, { date, indices });

  return {
    fieldId,
    date,
    indices: savedRecord.indices,
  };
}
