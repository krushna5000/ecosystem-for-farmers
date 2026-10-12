import { z } from "zod";
import { paginationQuerySchema } from "../../utils/superAdminPagination.js";

// Messages are the legacy API texts — clients display them as-is.
// Legacy checks were plain truthiness (`!state_name || !state_id`): a field is "missing" when it is
// absent, null, "" or 0 — so the value itself stays `any` and only the check is zod's.
const required = (message) => z.any().refine((value) => Boolean(value), message);

export const listQuerySchema = paginationQuerySchema;

// STATES
const stateBody = z.object({ state_name: required("state_name is required") }).passthrough();
export const createStateSchema = stateBody;
export const updateStateSchema = stateBody;

// DISTRICTS
const districtMessage = "district_name and state_id are required";
const districtBody = z
  .object({ district_name: required(districtMessage), state_id: required(districtMessage) })
  .passthrough();
export const createDistrictSchema = districtBody;
export const updateDistrictSchema = districtBody;

// CITIES
const cityMessage = "city_name and district_id are required";
const cityBody = z
  .object({ city_name: required(cityMessage), district_id: required(cityMessage) })
  .passthrough();
export const createCitySchema = cityBody;
export const updateCitySchema = cityBody;

// VILLAGES
const villageMessage = "village_name and city_id are required";
const villageBody = z
  .object({ village_name: required(villageMessage), city_id: required(villageMessage) })
  .passthrough();
export const createVillageSchema = villageBody;
export const updateVillageSchema = villageBody;

// PINCODES
const pincodeMessage = "pincode and village_id are required";
const pincodeBody = z
  .object({ pincode: required(pincodeMessage), village_id: required(pincodeMessage) })
  .passthrough();
export const createPincodeSchema = pincodeBody;
export const updatePincodeSchema = pincodeBody;

// BULK DELETE — one schema per entity, only the label in the message differs.
const bulkDeleteSchema = (label) => {
  const message = `Invalid ${label} IDs`;
  return z
    .object({
      ids: z.array(z.any(), { required_error: message, invalid_type_error: message }).min(1, message),
    })
    .passthrough();
};

export const bulkDeleteStatesSchema = bulkDeleteSchema("state");
export const bulkDeleteDistrictsSchema = bulkDeleteSchema("district");
export const bulkDeleteCitiesSchema = bulkDeleteSchema("city");
export const bulkDeleteVillagesSchema = bulkDeleteSchema("village");
export const bulkDeletePincodesSchema = bulkDeleteSchema("pincode");
