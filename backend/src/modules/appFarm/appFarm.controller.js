// Thin HTTP layer for farms and farm crops: take the validated request, call the service, send the response.
// No try/catch — Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as appFarmService from "./appFarm.service.js";
import { sendSuccess, sendCreated, sendJson } from "../../utils/response.js";

/* ------------------------------ farms ------------------------------ */

export async function addFarm(req, res) {
  const data = await appFarmService.addFarm(req.body);
  sendCreated(res, data, "Farm added successfully");
}

export async function getFarmsByUser(req, res) {
  const data = await appFarmService.listFarmsByUser(req.params.user_id);
  sendSuccess(res, data, "Farms retrieved successfully");
}

export async function getFarmById(req, res) {
  const data = await appFarmService.getFarmById(req.params.farm_id);
  sendSuccess(res, data, "Farm retrieved successfully");
}

export async function updateFarm(req, res) {
  const data = await appFarmService.updateFarm(req.params.farm_id, req.body);
  sendSuccess(res, data, "Farm updated successfully");
}

export async function deleteFarm(req, res) {
  await appFarmService.deleteFarm(req.params.farm_id);
  sendJson(res, { success: true, message: "Farm deleted successfully" });
}

/* ----------------------------- farm crops ----------------------------- */

export async function addFarmCrop(req, res) {
  const { data, weatherStored, weatherMessage } = await appFarmService.addFarmCrop(req.body);
  sendJson(
    res,
    { success: true, message: "Farm crop added successfully", data, weatherStored, weatherMessage },
    201,
  );
}

export async function getFarmCropsByFarm(req, res) {
  const data = await appFarmService.listFarmCropsByFarm(req.params.farm_id);
  sendSuccess(res, data, "Farm crops retrieved successfully");
}

export async function getFarmCropById(req, res) {
  const data = await appFarmService.getFarmCropById(req.params.id);
  sendSuccess(res, data, "Farm crop retrieved successfully");
}

export async function updateFarmCrop(req, res) {
  const data = await appFarmService.updateFarmCrop(req.params.id, req.body);
  sendSuccess(res, data, "Farm crop updated successfully");
}

export async function deleteFarmCrop(req, res) {
  await appFarmService.deleteFarmCrop(req.params.id);
  sendJson(res, { success: true, message: "Farm crop deleted successfully" });
}

export async function getFarmCropsByUser(req, res) {
  const data = await appFarmService.listFarmCropsByUser(req.params.user_id);
  sendSuccess(res, data, "Farm crops retrieved successfully");
}

/* ------------------------------ lookups ------------------------------ */

export async function getAllPincodes(req, res) {
  const pincodes = await appFarmService.listPincodes();
  sendJson(res, { success: true, pincodes });
}

export async function getAllCrops(req, res) {
  const data = await appFarmService.listCrops();
  sendSuccess(res, data, "Crops retrieved successfully");
}

// Answers the boundary object itself (or `null` for an unknown pincode), not an envelope.
export async function pincodeBoundary(req, res) {
  const boundary = await appFarmService.getPincodeBoundary(req.params.pincode);
  sendJson(res, boundary);
}
