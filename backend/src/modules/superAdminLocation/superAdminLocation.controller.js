// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not handled here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
// Every success body is a bespoke legacy shape ({ success, <entity>: row }), so they go out via sendJson.
import * as superAdminLocationService from "./superAdminLocation.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

// ---- generic handlers (identical across the five entities) ----
// `entity` selects the table in the service; `key` is the property name on the wire.
// snakeKeys(undefined) is undefined, so a missing row drops the key from the JSON, as before.

const listHandler = (entity, key) => async (req, res) => {
  const { rows, pagination } = await superAdminLocationService.listLocations(entity, req.query);
  sendJson(res, { success: true, [key]: snakeRows(rows), pagination });
};

const getByIdHandler = (entity, key) => async (req, res) => {
  const row = await superAdminLocationService.getLocationById(entity, req.params.id);
  sendJson(res, { success: true, [key]: snakeKeys(row) });
};

const deleteHandler = (entity, key) => async (req, res) => {
  const row = await superAdminLocationService.deleteLocation(entity, req.params.id);
  sendJson(res, { success: true, [key]: snakeKeys(row) });
};

const bulkDeleteHandler = (entity, pluralLabel) => async (req, res) => {
  const { deletedCount, deletedIds } = await superAdminLocationService.bulkDeleteLocations(entity, req.body.ids);
  sendJson(res, {
    success: true,
    message: `${pluralLabel} deleted successfully`,
    deletedCount,
    deletedIds,
  });
};

const toggleHandler = (entity, key) => async (req, res) => {
  const row = await superAdminLocationService.toggleLocationActive(entity, req.params.id);
  sendJson(res, { success: true, [key]: snakeKeys(row) });
};

// STATES
export async function createState(req, res) {
  const state = await superAdminLocationService.createState(req.body);
  sendJson(res, { success: true, state: snakeKeys(state) }, 201);
}

export const getAllStates = listHandler("state", "states");
export const getStateById = getByIdHandler("state", "state");

export async function updateState(req, res) {
  const state = await superAdminLocationService.updateState(req.params.id, req.body);
  sendJson(res, { success: true, state: snakeKeys(state) });
}

export const deleteState = deleteHandler("state", "state");
export const bulkDeleteStates = bulkDeleteHandler("state", "States");

// DISTRICTS
export async function createDistrict(req, res) {
  const district = await superAdminLocationService.createDistrict(req.body);
  sendJson(res, { success: true, district: snakeKeys(district) }, 201);
}

export const getAllDistricts = listHandler("district", "districts");
export const getDistrictById = getByIdHandler("district", "district");

export async function updateDistrict(req, res) {
  const district = await superAdminLocationService.updateDistrict(req.params.id, req.body);
  sendJson(res, { success: true, district: snakeKeys(district) });
}

export const deleteDistrict = deleteHandler("district", "district");
export const toggleDistrictActive = toggleHandler("district", "district");
export const bulkDeleteDistricts = bulkDeleteHandler("district", "Districts");

// CITIES
export async function createCity(req, res) {
  const city = await superAdminLocationService.createCity(req.body);
  sendJson(res, { success: true, city: snakeKeys(city) }, 201);
}

export const getAllCities = listHandler("city", "cities");
export const getCityById = getByIdHandler("city", "city");

export async function updateCity(req, res) {
  const city = await superAdminLocationService.updateCity(req.params.id, req.body);
  sendJson(res, { success: true, city: snakeKeys(city) });
}

export const deleteCity = deleteHandler("city", "city");
export const toggleCityActive = toggleHandler("city", "city");
export const bulkDeleteCities = bulkDeleteHandler("city", "Cities");

// VILLAGES
export async function createVillage(req, res) {
  const village = await superAdminLocationService.createVillage(req.body);
  sendJson(res, { success: true, village: snakeKeys(village) }, 201);
}

export const getAllVillages = listHandler("village", "villages");
export const getVillageById = getByIdHandler("village", "village");

export async function updateVillage(req, res) {
  const village = await superAdminLocationService.updateVillage(req.params.id, req.body);
  sendJson(res, { success: true, village: snakeKeys(village) });
}

export const deleteVillage = deleteHandler("village", "village");
export const toggleVillageActive = toggleHandler("village", "village");
export const bulkDeleteVillages = bulkDeleteHandler("village", "Villages");

// PINCODES
export async function createPincode(req, res) {
  const pincode = await superAdminLocationService.createPincode(req.body);
  sendJson(res, { success: true, pincode: snakeKeys(pincode) }, 201);
}

export const getAllPincodes = listHandler("pincode", "pincodes");
export const getPincodeById = getByIdHandler("pincode", "pincode");

export async function updatePincode(req, res) {
  const pincode = await superAdminLocationService.updatePincode(req.params.id, req.body);
  sendJson(res, { success: true, pincode: snakeKeys(pincode) });
}

export const deletePincode = deleteHandler("pincode", "pincode");
export const togglePincodeActive = toggleHandler("pincode", "pincode");
export const bulkDeletePincodes = bulkDeleteHandler("pincode", "Pincodes");

// HIERARCHY
export async function getHierarchy(req, res) {
  const hierarchy = await superAdminLocationService.getHierarchy();
  sendJson(res, { success: true, hierarchy });
}
