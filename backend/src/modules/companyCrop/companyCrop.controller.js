// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyCropService from "./companyCrop.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeRows } from "../../utils/rowCase.js";

// `{ success, message, data, pagination }`: the extra key is why this one is sent as-is.
export async function getAllCrops(req, res) {
  const { rows, pagination } = await companyCropService.listCrops(req.query);
  sendJson(res, {
    success: true,
    message: "Crops fetched successfully",
    data: snakeRows(rows),
    pagination,
  });
}
