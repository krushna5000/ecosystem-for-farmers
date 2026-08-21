// models/locationModel.js
import pool from "../config/db.js";

// STATES

export const createState = async (state_name) => {
  const query = `INSERT INTO location_schema.states (state_name) VALUES ($1) RETURNING *`;
  const result = await pool.query(query, [state_name]);
  return result.rows[0];
};

export const getStateByName = async (state_name) => {
  const query = `SELECT * FROM location_schema.states WHERE LOWER(state_name) = LOWER($1)`;
  const result = await pool.query(query, [state_name]);
  return result.rows[0];
};

export const getStateByNameExcludeId = async (state_name, exclude_id) => {
  const query = `SELECT * FROM location_schema.states WHERE LOWER(state_name) = LOWER($1) AND state_id != $2`;
  const result = await pool.query(query, [state_name, exclude_id]);
  return result.rows[0];
};

export const getAllStates = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM location_schema.states ORDER BY state_id LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM location_schema.states`;
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

export const getStateById = async (state_id) => {
  const query = `SELECT * FROM location_schema.states WHERE state_id = $1`;
  const result = await pool.query(query, [state_id]);
  return result.rows[0];
};

export const updateState = async (state_id, state_name) => {
  const query = `UPDATE location_schema.states SET state_name = $1, updated_at = CURRENT_TIMESTAMP WHERE state_id = $2 RETURNING *`;
  const result = await pool.query(query, [state_name, state_id]);
  return result.rows[0];
};

export const deleteState = async (state_id) => {
  const query = `DELETE FROM location_schema.states WHERE state_id = $1 RETURNING *`;
  const result = await pool.query(query, [state_id]);
  return result.rows[0];
};

// DISTRICTS

export const createDistrict = async (district_name, state_id) => {
  const query = `
    INSERT INTO location_schema.districts (district_name, state_id)
    VALUES ($1, $2) RETURNING *
  `;
  const result = await pool.query(query, [district_name, state_id]);
  return result.rows[0];
};

export const getAllDistricts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM location_schema.districts ORDER BY district_id LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM location_schema.districts`;
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

export const getDistrictById = async (district_id) => {
  const query = `SELECT * FROM location_schema.districts WHERE district_id = $1`;
  const result = await pool.query(query, [district_id]);
  return result.rows[0];
};

export const updateDistrict = async (district_id, district_name, state_id) => {
  const query = `
    UPDATE location_schema.districts
    SET district_name = $1, state_id = $2, updated_at = CURRENT_TIMESTAMP
    WHERE district_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [
    district_name,
    state_id,
    district_id,
  ]);
  return result.rows[0];
};

export const deleteDistrict = async (district_id) => {
  const query = `DELETE FROM location_schema.districts WHERE district_id = $1 RETURNING *`;
  const result = await pool.query(query, [district_id]);
  return result.rows[0];
};

export const getDistrictByName = async (district_name) => {
  const query = `SELECT * FROM location_schema.districts WHERE LOWER(district_name) = LOWER($1)`;
  const result = await pool.query(query, [district_name]);
  return result.rows[0];
};

export const getDistrictByNameExcludeId = async (district_name, state_id, exclude_id) => {
  const query = `SELECT * FROM location_schema.districts WHERE district_name = $1 AND state_id = $2 AND district_id != $3`;
  const result = await pool.query(query, [district_name, state_id, exclude_id]);
  return result.rows[0];
};

export const toggleDistrictActive = async (district_id) => {
  const query = `
    UPDATE location_schema.districts
    SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
    WHERE district_id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [district_id]);
  return result.rows[0];
};

export const getAllActiveDistricts = async () => {
  const query = `SELECT * FROM location_schema.districts WHERE is_active = TRUE ORDER BY district_id`;
  const result = await pool.query(query);
  return result.rows;
};

  // CITIES 

export const createCity = async (city_name, district_id) => {
  const query = `
    INSERT INTO location_schema.cities (city_name, district_id)
    VALUES ($1, $2) RETURNING *
  `;
  const result = await pool.query(query, [city_name, district_id]);
  return result.rows[0];
};

export const getCityByName = async (city_name, district_id) => {
  const query = `SELECT * FROM location_schema.cities WHERE LOWER(city_name) = LOWER($1) AND district_id = $2`;
  const result = await pool.query(query, [city_name, district_id]);
  return result.rows[0];
};

export const getCityByNameExcludeId = async (city_name, district_id, exclude_id) => {
  const query = `SELECT * FROM location_schema.cities WHERE LOWER(city_name) = LOWER($1) AND district_id = $2 AND city_id != $3`;
  const result = await pool.query(query, [city_name, district_id, exclude_id]);
  return result.rows[0];
};

export const getAllCities = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM location_schema.cities ORDER BY city_id LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM location_schema.cities`;
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

export const getCityById = async (city_id) => {
  const query = `SELECT * FROM location_schema.cities WHERE city_id = $1`;
  const result = await pool.query(query, [city_id]);
  return result.rows[0];
};

export const updateCity = async (city_id, city_name, district_id) => {
  const query = `
    UPDATE location_schema.cities
    SET city_name = $1, district_id = $2, updated_at = CURRENT_TIMESTAMP
    WHERE city_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [city_name, district_id, city_id]);
  return result.rows[0];
};

export const deleteCity = async (city_id) => {
  const query = `DELETE FROM location_schema.cities WHERE city_id = $1 RETURNING *`;
  const result = await pool.query(query, [city_id]);
  return result.rows[0];
};

export const toggleCityActive = async (city_id) => {
  const query = `
    UPDATE location_schema.cities
    SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
    WHERE city_id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [city_id]);
  return result.rows[0];
};

export const getAllActiveCities = async () => {
  const query = `SELECT * FROM location_schema.cities WHERE is_active = TRUE ORDER BY city_id`;
  const result = await pool.query(query);
  return result.rows;
};


//  VILLAGES

export const createVillage = async (village_name, city_id) => {
  const query = `
    INSERT INTO location_schema.villages (village_name, city_id)
    VALUES ($1, $2) RETURNING *
  `;
  const result = await pool.query(query, [village_name, city_id]);
  return result.rows[0];
};

export const getVillageById = async (village_id) => {
  const query = `
    SELECT * FROM location_schema.villages WHERE village_id = $1
  `;
  const result = await pool.query(query, [village_id]);
  return result.rows[0];
};

export const getAllVillages = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM location_schema.villages ORDER BY village_id LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM location_schema.villages`;
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

export const updateVillage = async (village_id, village_name, city_id) => {
  const query = `
    UPDATE location_schema.villages
    SET village_name = $1,
        city_id = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE village_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [village_name, city_id, village_id]);
  return result.rows[0];
};

export const deleteVillage = async (village_id) => {
  const query = `DELETE FROM location_schema.villages WHERE village_id = $1 RETURNING *`;
  const result = await pool.query(query, [village_id]);
  return result.rows[0];
};

export const toggleVillageActive = async (village_id) => {
  const query = `
    UPDATE location_schema.villages
    SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
    WHERE village_id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [village_id]);
  return result.rows[0];
};

export const getAllActiveVillages = async () => {
  const query = `SELECT * FROM location_schema.villages WHERE is_active = TRUE ORDER BY village_id`;
  const result = await pool.query(query);
  return result.rows;
};

export const getVillageByName = async (village_name, city_id) => {
  const query = `SELECT * FROM location_schema.villages WHERE LOWER(village_name) = LOWER($1) AND city_id = $2`;
  const result = await pool.query(query, [village_name, city_id]);
  return result.rows[0];
};

export const getVillageByNameExcludeId = async (village_name, city_id, exclude_id) => {
  const query = `SELECT * FROM location_schema.villages WHERE LOWER(village_name) = LOWER($1) AND city_id = $2 AND village_id != $3`;
  const result = await pool.query(query, [village_name, city_id, exclude_id]);
  return result.rows[0];
};

// PINCODES

export const createPincode = async (pincode, village_id) => {
  const query = `
    INSERT INTO location_schema.pincodes (pincode, village_id)
    VALUES ($1, $2) RETURNING *
  `;
  const result = await pool.query(query, [pincode, village_id]);
  return result.rows[0];
};

export const getAllPincodes = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM location_schema.pincodes ORDER BY pincode_id LIMIT $1 OFFSET $2`;
  const countQuery = `SELECT COUNT(*) FROM location_schema.pincodes`;
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

export const getPincodeById = async (pincode_id) => {
  const query = `SELECT * FROM location_schema.pincodes WHERE pincode_id = $1`;
  const result = await pool.query(query, [pincode_id]);
  return result.rows[0];
};

export const updatePincode = async (pincode_id, pincode, village_id) => {
  const query = `
    UPDATE location_schema.pincodes
    SET pincode = $1, village_id = $2, is_active = true, updated_at = CURRENT_TIMESTAMP
    WHERE pincode_id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [pincode, village_id, pincode_id]);
  return result.rows[0];
};

export const deletePincode = async (pincode_id) => {
  const query = `DELETE FROM location_schema.pincodes WHERE pincode_id = $1 RETURNING *`;
  const result = await pool.query(query, [pincode_id]);
  return result.rows[0];
};

export const getPincodeByValue = async (pincode, village_id) => {
  const query = `SELECT * FROM location_schema.pincodes WHERE pincode = $1 AND village_id = $2`;
  const result = await pool.query(query, [pincode, village_id]);
  return result.rows[0];
};

export const getPincodeByValueExcludeId = async (pincode, village_id, exclude_id) => {
  const query = `SELECT * FROM location_schema.pincodes WHERE pincode = $1 AND village_id = $2 AND pincode_id != $3`;
  const result = await pool.query(query, [pincode, village_id, exclude_id]);
  return result.rows[0];
};

export const togglePincodeActive = async (pincode_id) => {
  const query = `
    UPDATE location_schema.pincodes
    SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
    WHERE pincode_id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [pincode_id]);
  return result.rows[0];
};

export const getAllActivePincodes = async () => {
  const query = `SELECT * FROM location_schema.pincodes WHERE is_active = TRUE ORDER BY pincode_id`;
  const result = await pool.query(query);
  return result.rows;
};


  // FULL HIERARCHY 

export const getFullHierarchy = async () => {
  const query = `
    SELECT 
      s.state_id, s.state_name,
      d.district_id, d.district_name,
      c.city_id, c.city_name,
      v.village_id, v.village_name,
      p.pincode_id, p.pincode
    FROM location_schema.states s
    LEFT JOIN location_schema.districts d ON d.state_id = s.state_id
    LEFT JOIN location_schema.cities c ON c.district_id = d.district_id
    LEFT JOIN location_schema.villages v ON v.city_id = c.city_id
    LEFT JOIN location_schema.pincodes p ON p.village_id = v.village_id
    ORDER BY s.state_id, d.district_id, c.city_id, v.village_id, p.pincode_id
  `;

  const result = await pool.query(query);
  const rows = result.rows;
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
