// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not handled here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as superAdminCropStageService from "./superAdminCropStage.service.js";
import { sendCreated, sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCropStage(req, res) {
  const stage = await superAdminCropStageService.createCropStage(req.body);
  sendCreated(res, snakeKeys(stage), "Crop stage created successfully");
}

export async function getAllCropStages(req, res) {
  const { rows, pagination } = await superAdminCropStageService.listCropStages(req.query);
  sendJson(res, {
    success: true,
    message: "Crop stages retrieved successfully",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCropStageById(req, res) {
  const stage = await superAdminCropStageService.getCropStageById(req.params.id);
  sendSuccess(res, snakeKeys(stage), "Crop stage retrieved successfully");
}

export async function updateCropStage(req, res) {
  const stage = await superAdminCropStageService.updateCropStage(req.params.id, req.body);
  sendSuccess(res, snakeKeys(stage), "Crop stage updated successfully");
}

export async function deleteCropStage(req, res) {
  await superAdminCropStageService.deleteCropStage(req.params.id);
  sendJson(res, { success: true, message: "Crop stage deleted permanently" });
}

export async function bulkDeleteCropStages(req, res) {
  const { deletedCount, deletedIds } = await superAdminCropStageService.bulkDeleteCropStages(req.body.ids);
  sendJson(res, { success: true, message: "Crop stages deleted successfully", deletedCount, deletedIds });
}
