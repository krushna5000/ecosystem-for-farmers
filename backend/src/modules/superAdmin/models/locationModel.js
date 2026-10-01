import { eq, ne, and, asc, count, inArray, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { states, districts, cities, villages, pincodes } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";

const lowerEq = (col, value) => sql`lower(${col}) = lower(${value})`;

const first = async (query) => {
  const [row] = await query;
  return snakeKeys(row);
};

// Shared paginated "SELECT * ... ORDER BY id LIMIT/OFFSET" + COUNT(*)
const paginate = async (table, orderCol, page, limit) => {
  const offset = (page - 1) * limit;
  const rows = await db.select().from(table).orderBy(asc(orderCol)).limit(limit).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(table);
  return { data: snakeRows(rows), total };
};

// STATES

export const createState = (state_name) =>
  first(db.insert(states).values({ stateName: state_name }).returning());

export const getStateByName = (state_name) =>
  first(db.select().from(states).where(lowerEq(states.stateName, state_name)));

export const getStateByNameExcludeId = (state_name, exclude_id) =>
  first(
    db
      .select()
      .from(states)
      .where(and(lowerEq(states.stateName, state_name), ne(states.stateId, exclude_id))),
  );

export const getAllStates = (page = 1, limit = 10) => paginate(states, states.stateId, page, limit);

export const getStateById = (state_id) =>
  first(db.select().from(states).where(eq(states.stateId, state_id)));

export const updateState = (state_id, state_name) =>
  first(
    db.update(states).set({ stateName: state_name }).where(eq(states.stateId, state_id)).returning(),
  );

export const deleteState = (state_id) =>
  first(db.delete(states).where(eq(states.stateId, state_id)).returning());

// DISTRICTS

export const createDistrict = (district_name, state_id) =>
  first(db.insert(districts).values({ districtName: district_name, stateId: state_id }).returning());

export const getAllDistricts = (page = 1, limit = 10) =>
  paginate(districts, districts.districtId, page, limit);

export const getDistrictById = (district_id) =>
  first(db.select().from(districts).where(eq(districts.districtId, district_id)));

export const updateDistrict = (district_id, district_name, state_id) =>
  first(
    db
      .update(districts)
      .set({ districtName: district_name, stateId: state_id })
      .where(eq(districts.districtId, district_id))
      .returning(),
  );

export const deleteDistrict = (district_id) =>
  first(db.delete(districts).where(eq(districts.districtId, district_id)).returning());

export const getDistrictByName = (district_name) =>
  first(db.select().from(districts).where(lowerEq(districts.districtName, district_name)));

export const getDistrictByNameExcludeId = (district_name, state_id, exclude_id) =>
  first(
    db
      .select()
      .from(districts)
      .where(
        and(
          eq(districts.districtName, district_name),
          eq(districts.stateId, state_id),
          ne(districts.districtId, exclude_id),
        ),
      ),
  );

// CITIES

export const createCity = (city_name, district_id) =>
  first(db.insert(cities).values({ cityName: city_name, districtId: district_id }).returning());

export const getCityByName = (city_name, district_id) =>
  first(
    db
      .select()
      .from(cities)
      .where(and(lowerEq(cities.cityName, city_name), eq(cities.districtId, district_id))),
  );

export const getCityByNameExcludeId = (city_name, district_id, exclude_id) =>
  first(
    db
      .select()
      .from(cities)
      .where(
        and(
          lowerEq(cities.cityName, city_name),
          eq(cities.districtId, district_id),
          ne(cities.cityId, exclude_id),
        ),
      ),
  );

export const getAllCities = (page = 1, limit = 10) => paginate(cities, cities.cityId, page, limit);

export const getCityById = (city_id) =>
  first(db.select().from(cities).where(eq(cities.cityId, city_id)));

export const updateCity = (city_id, city_name, district_id) =>
  first(
    db
      .update(cities)
      .set({ cityName: city_name, districtId: district_id })
      .where(eq(cities.cityId, city_id))
      .returning(),
  );

export const deleteCity = (city_id) =>
  first(db.delete(cities).where(eq(cities.cityId, city_id)).returning());

// VILLAGES

export const createVillage = (village_name, city_id) =>
  first(db.insert(villages).values({ villageName: village_name, cityId: city_id }).returning());

export const getVillageById = (village_id) =>
  first(db.select().from(villages).where(eq(villages.villageId, village_id)));

export const getAllVillages = (page = 1, limit = 10) =>
  paginate(villages, villages.villageId, page, limit);

export const updateVillage = (village_id, village_name, city_id) =>
  first(
    db
      .update(villages)
      .set({ villageName: village_name, cityId: city_id })
      .where(eq(villages.villageId, village_id))
      .returning(),
  );

export const deleteVillage = (village_id) =>
  first(db.delete(villages).where(eq(villages.villageId, village_id)).returning());

export const getVillageByName = (village_name, city_id) =>
  first(
    db
      .select()
      .from(villages)
      .where(and(lowerEq(villages.villageName, village_name), eq(villages.cityId, city_id))),
  );

export const getVillageByNameExcludeId = (village_name, city_id, exclude_id) =>
  first(
    db
      .select()
      .from(villages)
      .where(
        and(
          lowerEq(villages.villageName, village_name),
          eq(villages.cityId, city_id),
          ne(villages.villageId, exclude_id),
        ),
      ),
  );

// PINCODES

export const createPincode = (pincode, village_id) =>
  first(db.insert(pincodes).values({ pincode, villageId: village_id }).returning());

export const getAllPincodes = (page = 1, limit = 10) =>
  paginate(pincodes, pincodes.pincodeId, page, limit);

export const getPincodeById = (pincode_id) =>
  first(db.select().from(pincodes).where(eq(pincodes.pincodeId, pincode_id)));

// Updating a pincode also re-activates it (as in the original query).
export const updatePincode = (pincode_id, pincode, village_id) =>
  first(
    db
      .update(pincodes)
      .set({ pincode, villageId: village_id, isActive: true })
      .where(eq(pincodes.pincodeId, pincode_id))
      .returning(),
  );

export const deletePincode = (pincode_id) =>
  first(db.delete(pincodes).where(eq(pincodes.pincodeId, pincode_id)).returning());

export const getPincodeByValue = (pincode, village_id) =>
  first(
    db
      .select()
      .from(pincodes)
      .where(and(eq(pincodes.pincode, pincode), eq(pincodes.villageId, village_id))),
  );

export const getPincodeByValueExcludeId = (pincode, village_id, exclude_id) =>
  first(
    db
      .select()
      .from(pincodes)
      .where(
        and(
          eq(pincodes.pincode, pincode),
          eq(pincodes.villageId, village_id),
          ne(pincodes.pincodeId, exclude_id),
        ),
      ),
  );

// BULK DELETE (generic: DELETE ... WHERE id IN (ids) RETURNING id)

export const bulkDeleteByIds = async (table, idCol, ids) => {
  const rows = await db.delete(table).where(inArray(idCol, ids)).returning({ id: idCol });
  return rows.map((row) => row.id);
};

// FULL HIERARCHY

export const getFullHierarchy = async () => {
  const rows = await db
    .select({
      state_id: states.stateId,
      state_name: states.stateName,
      district_id: districts.districtId,
      district_name: districts.districtName,
      city_id: cities.cityId,
      city_name: cities.cityName,
      village_id: villages.villageId,
      village_name: villages.villageName,
      pincode_id: pincodes.pincodeId,
      pincode: pincodes.pincode,
    })
    .from(states)
    .leftJoin(districts, eq(districts.stateId, states.stateId))
    .leftJoin(cities, eq(cities.districtId, districts.districtId))
    .leftJoin(villages, eq(villages.cityId, cities.cityId))
    .leftJoin(pincodes, eq(pincodes.villageId, villages.villageId))
    .orderBy(
      asc(states.stateId),
      asc(districts.districtId),
      asc(cities.cityId),
      asc(villages.villageId),
      asc(pincodes.pincodeId),
    );

  const hierarchy = {};

  rows.forEach((row) => {
    // STATE
    if (!hierarchy[row.state_id]) {
      hierarchy[row.state_id] = {
        state_id: row.state_id,
        state_name: row.state_name,
        districts: {},
      };
    }
    const state = hierarchy[row.state_id];

    // DISTRICT
    if (row.district_id) {
      if (!state.districts[row.district_id]) {
        state.districts[row.district_id] = {
          district_id: row.district_id,
          district_name: row.district_name,
          cities: {},
        };
      }
    } else return;

    const district = state.districts[row.district_id];

    // CITY
    if (row.city_id) {
      if (!district.cities[row.city_id]) {
        district.cities[row.city_id] = {
          city_id: row.city_id,
          city_name: row.city_name,
          villages: {},
        };
      }
    } else return;

    const city = district.cities[row.city_id];

    // VILLAGE
    if (row.village_id) {
      if (!city.villages[row.village_id]) {
        city.villages[row.village_id] = {
          village_id: row.village_id,
          village_name: row.village_name,
          pincodes: [],
        };
      }
    } else return;

    const village = city.villages[row.village_id];

    // PINCODE
    if (row.pincode_id) {
      village.pincodes.push({
        pincode_id: row.pincode_id,
        pincode: row.pincode,
      });
    }
  });

  return Object.values(hierarchy).map((state) => ({
    ...state,
    districts: Object.values(state.districts).map((district) => ({
      ...district,
      cities: Object.values(district.cities).map((city) => ({
        ...city,
        villages: Object.values(city.villages),
      })),
    })),
  }));
};
