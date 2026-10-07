import * as locationModel from "./location.model.js";
import { toggleActive } from "./locationToggle.service.js";
import { states, districts, cities, villages, pincodes } from "../../../db/schema/index.js";
import { errorMessage } from "../../../errors/dbError.js";
import { parsePagination, buildPagination } from "../../../utils/superAdmin/pagination.js";

const serverError = (res, error) =>
  res.status(500).json({ success: false, error: errorMessage(error) });

const badRequest = (res, message) => res.status(400).json({ success: false, message });
const conflict = (res, message) => res.status(409).json({ success: false, message });

// Wraps a handler so a thrown error becomes the standard 500 response.
const safe = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    serverError(res, error);
  }
};

// ---- generic handlers (identical across the five entities) ----

const listHandler = (key, modelFn) =>
  safe(async (req, res) => {
    const { page, limit } = parsePagination(req.query);
    const result = await modelFn(page, limit);

    res.json({
      success: true,
      [key]: result.data,
      pagination: buildPagination(page, limit, result.total),
    });
  });

const getByIdHandler = (key, label, modelFn) =>
  safe(async (req, res) => {
    const row = await modelFn(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: `${label} not found` });
    res.json({ success: true, [key]: row });
  });

const deleteHandler = (key, modelFn) =>
  safe(async (req, res) => {
    const row = await modelFn(req.params.id);
    res.json({ success: true, [key]: row });
  });

const bulkDeleteHandler = (label, pluralLabel, table, idCol) =>
  safe(async (req, res) => {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return badRequest(res, `Invalid ${label} IDs`);
    }

    const deletedIds = await locationModel.bulkDeleteByIds(table, idCol, ids);

    res.json({
      success: true,
      message: `${pluralLabel} deleted successfully`,
      deletedCount: deletedIds.length,
      deletedIds,
    });
  });

const toggleHandler = (entityType, key) =>
  safe(async (req, res) => {
    const result = await toggleActive(entityType, req.params.id);
    if (result.status === "ok") return res.json({ success: true, [key]: result.row });
    return res.status(result.status).json({ success: false, message: result.message });
  });

// STATES
export const createState = safe(async (req, res) => {
  const { state_name } = req.body || {};

  if (!state_name) return badRequest(res, "state_name is required");

  if (await locationModel.getStateByName(state_name)) return conflict(res, "State already exists");

  const state = await locationModel.createState(state_name);
  res.status(201).json({ success: true, state });
});

export const getAllStates = listHandler("states", locationModel.getAllStates);
export const getStateById = getByIdHandler("state", "State", locationModel.getStateById);

export const updateState = safe(async (req, res) => {
  const { id } = req.params;
  const { state_name } = req.body || {};

  if (!state_name) return badRequest(res, "state_name is required");

  if (await locationModel.getStateByNameExcludeId(state_name, id)) {
    return conflict(res, "State name already exists");
  }

  const state = await locationModel.updateState(id, state_name);
  res.json({ success: true, state });
});

export const deleteState = deleteHandler("state", locationModel.deleteState);

// DISTRICTS
export const createDistrict = safe(async (req, res) => {
  const { district_name, state_id } = req.body || {};

  if (!district_name || !state_id) return badRequest(res, "district_name and state_id are required");

  if (await locationModel.getDistrictByName(district_name)) {
    return conflict(res, "District already exists");
  }

  const district = await locationModel.createDistrict(district_name, state_id);
  res.status(201).json({ success: true, district });
});

export const getAllDistricts = listHandler("districts", locationModel.getAllDistricts);
export const getDistrictById = getByIdHandler("district", "District", locationModel.getDistrictById);

export const updateDistrict = safe(async (req, res) => {
  const { id } = req.params;
  const { district_name, state_id } = req.body || {};

  if (!district_name || !state_id) return badRequest(res, "district_name and state_id are required");

  const trimmedDistrictName = district_name.trim();

  if (await locationModel.getDistrictByNameExcludeId(trimmedDistrictName, state_id, id)) {
    return conflict(res, "District already exists");
  }

  const district = await locationModel.updateDistrict(id, trimmedDistrictName, state_id);
  res.json({ success: true, district });
});

export const deleteDistrict = deleteHandler("district", locationModel.deleteDistrict);
export const toggleDistrictActive = toggleHandler("district", "district");

// CITIES
export const createCity = safe(async (req, res) => {
  const { city_name, district_id } = req.body || {};

  if (!city_name || !district_id) return badRequest(res, "city_name and district_id are required");

  if (await locationModel.getCityByName(city_name, district_id)) {
    return conflict(res, "City already exists");
  }

  const city = await locationModel.createCity(city_name, district_id);
  res.status(201).json({ success: true, city });
});

export const getAllCities = listHandler("cities", locationModel.getAllCities);
export const getCityById = getByIdHandler("city", "City", locationModel.getCityById);

export const updateCity = safe(async (req, res) => {
  const { id } = req.params;
  const { city_name, district_id } = req.body || {};

  if (!city_name || !district_id) return badRequest(res, "city_name and district_id are required");

  if (await locationModel.getCityByNameExcludeId(city_name, district_id, id)) {
    return conflict(res, "City name already exists");
  }

  const city = await locationModel.updateCity(id, city_name, district_id);
  res.json({ success: true, city });
});

export const deleteCity = deleteHandler("city", locationModel.deleteCity);
export const toggleCityActive = toggleHandler("city", "city");

// VILLAGES
export const createVillage = safe(async (req, res) => {
  const { village_name, city_id } = req.body || {};

  if (!village_name || !city_id) return badRequest(res, "village_name and city_id are required");

  if (await locationModel.getVillageByName(village_name, city_id)) {
    return conflict(res, "Village already exists");
  }

  const village = await locationModel.createVillage(village_name, city_id);
  res.status(201).json({ success: true, village });
});

export const getAllVillages = listHandler("villages", locationModel.getAllVillages);
export const getVillageById = getByIdHandler("village", "Village", locationModel.getVillageById);

export const updateVillage = safe(async (req, res) => {
  const { id } = req.params;
  const { village_name, city_id } = req.body || {};

  if (!village_name || !city_id) return badRequest(res, "village_name and city_id are required");

  const trimmedVillageName = village_name.trim();

  if (await locationModel.getVillageByNameExcludeId(trimmedVillageName, city_id, id)) {
    return conflict(res, "Village already exists");
  }

  const village = await locationModel.updateVillage(id, trimmedVillageName, city_id);
  res.json({ success: true, village });
});

export const deleteVillage = deleteHandler("village", locationModel.deleteVillage);
export const toggleVillageActive = toggleHandler("village", "village");

// PINCODES
export const createPincode = safe(async (req, res) => {
  const { pincode, village_id } = req.body || {};

  if (!pincode || !village_id) return badRequest(res, "pincode and village_id are required");

  if (await locationModel.getPincodeByValue(pincode, village_id)) {
    return conflict(res, "Pincode already exists for this village");
  }

  const newPincode = await locationModel.createPincode(pincode, village_id);
  res.status(201).json({ success: true, pincode: newPincode });
});

export const getAllPincodes = listHandler("pincodes", locationModel.getAllPincodes);
export const getPincodeById = getByIdHandler("pincode", "Pincode", locationModel.getPincodeById);

export const updatePincode = safe(async (req, res) => {
  const { id } = req.params;
  const { pincode, village_id } = req.body || {};

  if (!pincode || !village_id) return badRequest(res, "pincode and village_id are required");

  if (await locationModel.getPincodeByValueExcludeId(pincode, village_id, id)) {
    return conflict(res, "Pincode already exists for this village");
  }

  const updatedPincode = await locationModel.updatePincode(id, pincode, village_id);
  res.json({ success: true, pincode: updatedPincode });
});

export const deletePincode = deleteHandler("pincode", locationModel.deletePincode);
export const togglePincodeActive = toggleHandler("pincode", "pincode");

// HIERARCHY
export const getHierarchy = safe(async (req, res) => {
  const hierarchy = await locationModel.getFullHierarchy();
  res.json({ success: true, hierarchy });
});

// BULK DELETE
export const bulkDeleteStates = bulkDeleteHandler("state", "States", states, states.stateId);
export const bulkDeleteDistricts = bulkDeleteHandler("district", "Districts", districts, districts.districtId);
export const bulkDeleteCities = bulkDeleteHandler("city", "Cities", cities, cities.cityId);
export const bulkDeleteVillages = bulkDeleteHandler("village", "Villages", villages, villages.villageId);
export const bulkDeletePincodes = bulkDeleteHandler("pincode", "Pincodes", pincodes, pincodes.pincodeId);
