// Thin HTTP layer for field indexes. No try/catch — Express 5 forwards rejected promises to errorHandler.
import * as appIndexesService from "./appIndexes.service.js";
import { sendJson } from "../../utils/response.js";

// JUST FETCH INDEXES (NO DB) — also mounted by the farms router at GET /farms/indices/:fieldId
export async function getFieldIndices(req, res) {
  const { fieldId, indices } = await appIndexesService.fetchFieldIndices(req.params.fieldId);
  // Farmonaut returns data mapped by date strings
  sendJson(res, { success: true, fieldId, indices });
}

// FETCH + MAP + STORE INDEXES (MAIN)
export async function fetchAndStoreIndexes(req, res) {
  const result = await appIndexesService.fetchAndStoreIndexes(req.params.fieldId);
  sendJson(res, { success: true, message: "Indexes fetched & stored successfully", ...result });
}
