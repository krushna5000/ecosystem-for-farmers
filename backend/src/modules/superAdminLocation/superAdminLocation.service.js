// Business rules for the location hierarchy (state > district > city > village > pincode).
// Throws AppError subclasses; never runs queries itself. `db` is imported only to open the transaction
// of the toggle (SELECT ... FOR UPDATE + cascade) — every query lives in the factory.
//
// Generic operations take an entity key: "state" | "district" | "city" | "village" | "pincode".
import { db } from "../../db/connection.js";
import {
  listLocationsInDB,
  getLocationByIdInDB,
  createLocationInDB,
  updateLocationInDB,
  deleteLocationInDB,
  bulkDeleteLocationsInDB,
  findStateByNameInDB,
  findStateByNameExcludingIdInDB,
  findDistrictByNameInDB,
  findDistrictByNameExcludingIdInDB,
  findCityByNameInDB,
  findCityByNameExcludingIdInDB,
  findVillageByNameInDB,
  findVillageByNameExcludingIdInDB,
  findPincodeByValueInDB,
  findPincodeByValueExcludingIdInDB,
  lockLocationActiveInDB,
  getLocationAncestorsInDB,
  disableLocationDescendantsInDB,
  listLocationHierarchyRowsInDB,
} from "./superAdminLocation.factory.js";
import { TOGGLE_LEVELS } from "./superAdminLocation.toggle.js";
import { buildHierarchy } from "./superAdminLocation.hierarchy.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../errors/index.js";
import { buildPagination } from "../../utils/superAdminPagination.js";

const LABELS = {
  state: "State",
  district: "District",
  city: "City",
  village: "Village",
  pincode: "Pincode",
};

/* ---------------------------------------------------------------------------------------------- */
/* Generic operations (identical across the five entities)                                          */
/* ---------------------------------------------------------------------------------------------- */

export async function listLocations(entity, { page, limit }) {
  const { rows, total } = await listLocationsInDB(entity, { limit, offset: (page - 1) * limit });
  return { rows, pagination: buildPagination(page, limit, total) };
}

export async function getLocationById(entity, id) {
  const row = await getLocationByIdInDB(entity, id);
  if (!row) {
    // The legacy not-found body carries `error`, not `message` — pin it.
    const message = `${LABELS[entity]} not found`;
    throw new NotFoundError(message, { body: { success: false, error: message } });
  }
  return row;
}

// Legacy deletes never 404: an unknown id answers 200 without the entity key.
export function deleteLocation(entity, id) {
  return deleteLocationInDB(entity, id);
}

export async function bulkDeleteLocations(entity, ids) {
  const deletedIds = await bulkDeleteLocationsInDB(entity, ids);
  return { deletedCount: deletedIds.length, deletedIds };
}

/* ---------------------------------------------------------------------------------------------- */
/* States                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

export async function createState({ state_name }) {
  if (await findStateByNameInDB(state_name)) throw new ConflictError("State already exists");

  return createLocationInDB("state", { stateName: state_name });
}

export async function updateState(id, { state_name }) {
  if (await findStateByNameExcludingIdInDB(state_name, id)) {
    throw new ConflictError("State name already exists");
  }

  return updateLocationInDB("state", id, { stateName: state_name });
}

/* ---------------------------------------------------------------------------------------------- */
/* Districts                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export async function createDistrict({ district_name, state_id }) {
  if (await findDistrictByNameInDB(district_name)) throw new ConflictError("District already exists");

  return createLocationInDB("district", { districtName: district_name, stateId: state_id });
}

export async function updateDistrict(id, { district_name, state_id }) {
  const trimmedDistrictName = district_name.trim();

  if (await findDistrictByNameExcludingIdInDB(trimmedDistrictName, state_id, id)) {
    throw new ConflictError("District already exists");
  }

  return updateLocationInDB("district", id, { districtName: trimmedDistrictName, stateId: state_id });
}

/* ---------------------------------------------------------------------------------------------- */
/* Cities                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

export async function createCity({ city_name, district_id }) {
  if (await findCityByNameInDB(city_name, district_id)) throw new ConflictError("City already exists");

  return createLocationInDB("city", { cityName: city_name, districtId: district_id });
}

export async function updateCity(id, { city_name, district_id }) {
  if (await findCityByNameExcludingIdInDB(city_name, district_id, id)) {
    throw new ConflictError("City name already exists");
  }

  return updateLocationInDB("city", id, { cityName: city_name, districtId: district_id });
}

/* ---------------------------------------------------------------------------------------------- */
/* Villages                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export async function createVillage({ village_name, city_id }) {
  if (await findVillageByNameInDB(village_name, city_id)) throw new ConflictError("Village already exists");

  return createLocationInDB("village", { villageName: village_name, cityId: city_id });
}

export async function updateVillage(id, { village_name, city_id }) {
  const trimmedVillageName = village_name.trim();

  if (await findVillageByNameExcludingIdInDB(trimmedVillageName, city_id, id)) {
    throw new ConflictError("Village already exists");
  }

  return updateLocationInDB("village", id, { villageName: trimmedVillageName, cityId: city_id });
}

/* ---------------------------------------------------------------------------------------------- */
/* Pincodes                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

const PINCODE_TAKEN = "Pincode already exists for this village";

export async function createPincode({ pincode, village_id }) {
  if (await findPincodeByValueInDB(pincode, village_id)) throw new ConflictError(PINCODE_TAKEN);

  return createLocationInDB("pincode", { pincode, villageId: village_id });
}

// Updating a pincode also re-activates it (as in the original query).
export async function updatePincode(id, { pincode, village_id }) {
  if (await findPincodeByValueExcludingIdInDB(pincode, village_id, id)) {
    throw new ConflictError(PINCODE_TAKEN);
  }

  return updateLocationInDB("pincode", id, { pincode, villageId: village_id, isActive: true });
}

/* ---------------------------------------------------------------------------------------------- */
/* Toggle active                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Transactionally flips is_active of a district / city / village / pincode.
 * Enabling requires every ancestor to be active; disabling cascades to all descendants.
 * Resolves to the updated row.
 */
export function toggleLocationActive(entity, id) {
  const { notFound, ancestorsActive, enableBlockedMessage } = TOGGLE_LEVELS[entity];

  return db.transaction(async (tx) => {
    const current = await lockLocationActiveInDB(entity, id, tx);
    if (!current) throw new NotFoundError(notFound);

    const newState = !current.isActive;

    if (newState) {
      if (enableBlockedMessage) {
        const ancestors = await getLocationAncestorsInDB(entity, id, tx);
        if (ancestors && !ancestorsActive(ancestors)) {
          throw new BadRequestError(enableBlockedMessage(ancestors));
        }
      }
    } else {
      await disableLocationDescendantsInDB(entity, id, tx);
    }

    return updateLocationInDB(entity, id, { isActive: newState }, tx);
  });
}

/* ---------------------------------------------------------------------------------------------- */
/* Hierarchy                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export async function getHierarchy() {
  return buildHierarchy(await listLocationHierarchyRowsInDB());
}
