// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not handled here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as superAdminCropService from "./superAdminCrop.service.js";
import { sendCreated, sendJson } from "../../utils/response.js";
import { snakeKeys } from "../../utils/rowCase.js";

export async function addCrop(req, res) {
  const crop = await superAdminCropService.createCrop(req.body ?? {});
  sendCreated(res, snakeKeys(crop), "Crop added successfully");
}

export async function updateCrop(req, res) {
  const crop = await superAdminCropService.updateCrop(req.params.id, req.body ?? {});
  sendJson(res, { success: true, message: "Crop updated successfully", data: snakeKeys(crop) });
}

export async function deleteCrop(req, res) {
  await superAdminCropService.deleteCrop(req.params.id);
  sendJson(res, { success: true, message: "Crop deleted successfully" });
}

export async function getAllCrops(req, res) {
  const { rows, pagination } = await superAdminCropService.listCrops(req.query);
  sendJson(res, { success: true, data: rows, pagination });
}

export async function bulkDeleteCrops(req, res) {
  const { deletedCount, deletedIds } = await superAdminCropService.bulkDeleteCrops(req.body.ids);
  sendJson(res, { success: true, message: "Crops deleted successfully", deletedCount, deletedIds });
}
