// Pure transformation (no DB, no Express): the flat LEFT JOIN rows of the location tree
// → nested state > districts > cities > villages > pincodes.

/**
 * @param {Array<{state_id, state_name, district_id, district_name, city_id, city_name,
 *               village_id, village_name, pincode_id, pincode}>} rows ordered by every id
 */
export function buildHierarchy(rows) {
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
}
