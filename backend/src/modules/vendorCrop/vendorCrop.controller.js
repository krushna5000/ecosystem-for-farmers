// Thin HTTP layer: take the request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorCropService from "./vendorCrop.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeRows } from "../../utils/rowCase.js";

// Bespoke body: `{ success, count, crops }`
export async function getAllCrops(req, res) {
  const rows = await vendorCropService.listCrops();
  sendJson(res, { success: true, count: rows.length, crops: snakeRows(rows) });
}
