import * as locationModel from "../models/locationModel.js";
import pool from "../config/db.js";

// HELPER FUNCTIONS

// Get ancestors for parent validation
const getAncestors = async (entityType, id, trx = pool) => {
  let query;
  switch (entityType) {
    case 'pincode':
      query = `
        SELECT d.is_active as district_active, d.district_name,
               c.is_active as city_active, c.city_name,
               v.is_active as village_active, v.village_name
        FROM location_schema.pincodes p
        JOIN location_schema.villages v ON p.village_id = v.village_id
        JOIN location_schema.cities c ON v.city_id = c.city_id
        JOIN location_schema.districts d ON c.district_id = d.district_id
        WHERE p.pincode_id = $1
      `;
      break;
    case 'village':
      query = `
        SELECT d.is_active as district_active, d.district_name,
               c.is_active as city_active, c.city_name
        FROM location_schema.villages v
        JOIN location_schema.cities c ON v.city_id = c.city_id
        JOIN location_schema.districts d ON c.district_id = d.district_id
        WHERE v.village_id = $1
      `;
      break;
    case 'city':
      query = `
        SELECT d.is_active as district_active, d.district_name
        FROM location_schema.cities c
        JOIN location_schema.districts d ON c.district_id = d.district_id
        WHERE c.city_id = $1
      `;
      break;
    default:
      return null;
  }
  const result = await trx.query(query, [id]);
  return result.rows[0];
};

// Parent validation for enabling
const parentCheck = async (entityType, id, trx = pool) => {
  const ancestors = await getAncestors(entityType, id, trx);
  if (!ancestors) return { valid: true }; // district has no parents

  switch (entityType) {
    case 'city':
      return { valid: ancestors.district_active, ancestors };
    case 'village':
      return { valid: ancestors.district_active && ancestors.city_active, ancestors };
    case 'pincode':
      return { valid: ancestors.district_active && ancestors.city_active && ancestors.village_active, ancestors };
    default:
      return { valid: true };
  }
};

// Cascade disable children
const cascadeDisable = async (entityType, id, trx) => {
  switch (entityType) {
    case 'district':
      // Disable pincodes under district
      await trx.query(`
        UPDATE location_schema.pincodes
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE village_id IN (
          SELECT village_id FROM location_schema.villages
          WHERE city_id IN (
            SELECT city_id FROM location_schema.cities WHERE district_id = $1
          )
        )
      `, [id]);

      // Disable villages under district
      await trx.query(`
        UPDATE location_schema.villages
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE city_id IN (SELECT city_id FROM location_schema.cities WHERE district_id = $1)
      `, [id]);

      // Disable cities under district
      await trx.query(`
        UPDATE location_schema.cities
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE district_id = $1
      `, [id]);

      break;

    case 'city':
      // Disable pincodes under city
      await trx.query(`
        UPDATE location_schema.pincodes
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE village_id IN (SELECT village_id FROM location_schema.villages WHERE city_id = $1)
      `, [id]);

      // Disable villages under city
      await trx.query(`
        UPDATE location_schema.villages
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE city_id = $1
      `, [id]);

      break;

    case 'village':
      // Disable pincodes under village
      await trx.query(`
        UPDATE location_schema.pincodes
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE village_id = $1
      `, [id]);

      break;
  }
};

//STATES
export const createState = async (req, res) => {
  try {
    const { state_name } = req.body;

    // 400 Missing field
    if (!state_name) {
      return res.status(400).json({
        success: false,
        message: "state_name is required",
      });
    }

    // 409 Duplicate check
    const existingState = await locationModel.getStateByName(state_name);
    if (existingState) {
      return res.status(409).json({
        success: false,
        message: "State already exists",
      });
    }
    

    const state = await locationModel.createState(state_name);
    res.status(201).json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getAllStates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await locationModel.getAllStates(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.json({ 
      success: true, 
      states: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await locationModel.getStateById(id);
    if (!state)
      return res.status(404).json({ success: false, error: "State not found" });
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name } = req.body;

    // Validate input
    if (!state_name) {
      return res.status(400).json({
        success: false,
        message: "state_name is required",
      });
    }

    // Check if state name already exists (excluding current state)
    const existingState = await locationModel.getStateByNameExcludeId(state_name, id);
    if (existingState) {
      return res.status(409).json({
        success: false,
        message: "State name already exists",
      });
    }

    const state = await locationModel.updateState(id, state_name);
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await locationModel.deleteState(id);
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//DISTRICTS
export const createDistrict = async (req, res) => {
  try {
    const { district_name, state_id } = req.body;

    // Validate input
    if (!district_name || !state_id) {
      return res.status(400).json({
        success: false,
        message: "district_name and state_id are required",
      });
    }

    // Check if district already exists
    const existingDistrict = await locationModel.getDistrictByName(
      district_name
    );
    if (existingDistrict) {
      return res.status(409).json({
        success: false,
        message: "District already exists",
      });
    }

    // Create district
    const district = await locationModel.createDistrict(
      district_name,
      state_id
    );

    res.status(201).json({
      success: true,
      district,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllDistricts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await locationModel.getAllDistricts(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.json({ 
      success: true, 
      districts: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDistrictById = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await locationModel.getDistrictById(id);
    if (!district)
      return res
        .status(404)
        .json({ success: false, error: "District not found" });
    res.json({ success: true, district });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { district_name, state_id } = req.body;

    // Validate input
    if (!district_name || !state_id) {
      return res.status(400).json({
        success: false,
        message: "district_name and state_id are required",
      });
    }

    // Trim inputs to prevent space-related issues
    const trimmedDistrictName = district_name.trim();

    // Check if district name already exists (excluding current district)
    const existingDistrict = await locationModel.getDistrictByNameExcludeId(trimmedDistrictName, state_id, id);
    if (existingDistrict) {
      return res.status(409).json({
        success: false,
        message: "District already exists",
      });
    }

    const district = await locationModel.updateDistrict(
      id,
      trimmedDistrictName,
      state_id
    );
    res.json({ success: true, district });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const district = await locationModel.deleteDistrict(id);
    res.json({ success: true, district });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleDistrictActive = async (req, res) => {
  const trx = await pool.connect();
  try {
    await trx.query('BEGIN');

    // Get current state
    const currentQuery = `SELECT is_active FROM location_schema.districts WHERE district_id = $1 FOR UPDATE`;
    const currentResult = await trx.query(currentQuery, [req.params.id]);
    if (currentResult.rows.length === 0) {
      await trx.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "District not found" });
    }

    const newState = !currentResult.rows[0].is_active;

    if (!newState) {
      // Disabling - cascade disable children
      await cascadeDisable('district', req.params.id, trx);
    }

    // Toggle district
    const toggleQuery = `
      UPDATE location_schema.districts
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE district_id = $2
      RETURNING *
    `;
    const result = await trx.query(toggleQuery, [newState, req.params.id]);

    await trx.query('COMMIT');
    res.json({ success: true, district: result.rows[0] });
  } catch (error) {
    await trx.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    trx.release();
  }
};

export const getAllActiveDistricts = async (req, res) => {
  try {
    const districts = await locationModel.getAllActiveDistricts();
    res.json({ success: true, districts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//CITIES 
//CITIES
export const createCity = async (req, res) => {
  try {
    const { city_name, district_id } = req.body;

    console.log(city_name, district_id);

    if (!city_name || !district_id) {
      return res.status(400).json({
        success: false,
        message: "city_name and district_id are required",
      });
    }

    const existingCity = await locationModel.getCityByName(
      city_name,
      district_id
    );
    if (existingCity) {
      return res.status(409).json({
        success: false,
        message: "City already exists",
      });
    }

    const city = await locationModel.createCity(city_name, district_id);
    res.status(201).json({ success: true, city });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllCities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await locationModel.getAllCities(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.json({ 
      success: true, 
      cities: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await locationModel.getCityById(id);
    if (!city)
      return res.status(404).json({ success: false, error: "City not found" });
    res.json({ success: true, city });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_name, district_id } = req.body;

    // Validate input
    if (!city_name || !district_id) {
      return res.status(400).json({
        success: false,
        message: "city_name and district_id are required",
      });
    }

    // Check if city name already exists (excluding current city)
    const existingCity = await locationModel.getCityByNameExcludeId(city_name, district_id, id);
    if (existingCity) {
      return res.status(409).json({
        success: false,
        message: "City name already exists",
      });
    }

    const city = await locationModel.updateCity(id, city_name, district_id);
    res.json({ success: true, city });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await locationModel.deleteCity(id);
    res.json({ success: true, city });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleCityActive = async (req, res) => {
  const trx = await pool.connect();
  try {
    await trx.query('BEGIN');

    // Get current state
    const currentQuery = `SELECT is_active FROM location_schema.cities WHERE city_id = $1 FOR UPDATE`;
    const currentResult = await trx.query(currentQuery, [req.params.id]);
    if (currentResult.rows.length === 0) {
      await trx.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "City not found" });
    }

    const newState = !currentResult.rows[0].is_active;

    if (newState) {
      // Enabling - check parent district
      const parentResult = await parentCheck('city', req.params.id, trx);
      if (!parentResult.valid) {
        await trx.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Cannot enable city. Please enable the parent District "${parentResult.ancestors.district_name}" first.`
        });
      }
    } else {
      // Disabling - cascade disable children
      await cascadeDisable('city', req.params.id, trx);
    }

    // Toggle city
    const toggleQuery = `
      UPDATE location_schema.cities
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE city_id = $2
      RETURNING *
    `;
    const result = await trx.query(toggleQuery, [newState, req.params.id]);

    await trx.query('COMMIT');
    res.json({ success: true, city: result.rows[0] });
  } catch (error) {
    await trx.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    trx.release();
  }
};

export const getAllActiveCities = async (req, res) => {
  try {
    const cities = await locationModel.getAllActiveCities();
    res.json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//VILLAGES
export const createVillage = async (req, res) => {
  try {
    const { village_name, city_id } = req.body;

    if (!village_name || !city_id) {
      return res.status(400).json({
        success: false,
        message: "village_name and city_id are required",
      });
    }

    const existingVillage = await locationModel.getVillageByName(
      village_name,
      city_id
    );
    if (existingVillage) {
      return res.status(409).json({
        success: false,
        message: "Village already exists",
      });
    }

    const village = await locationModel.createVillage(village_name, city_id);
    res.status(201).json({ success: true, village });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllVillages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await locationModel.getAllVillages(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.json({ 
      success: true, 
      villages: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getVillageById = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await locationModel.getVillageById(id);
    if (!village)
      return res
        .status(404)
        .json({ success: false, error: "Village not found" });
    res.json({ success: true, village });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const { village_name, city_id } = req.body;

    // Validate input
    if (!village_name || !city_id) {
      return res.status(400).json({
        success: false,
        message: "village_name and city_id are required",
      });
    }

    // Trim inputs to prevent space-related issues
    const trimmedVillageName = village_name.trim();

    // Check if village name already exists (excluding current village)
    const existingVillage = await locationModel.getVillageByNameExcludeId(trimmedVillageName, city_id, id);
    if (existingVillage) {
      return res.status(409).json({
        success: false,
        message: "Village already exists",
      });
    }

    const village = await locationModel.updateVillage(
      id,
      trimmedVillageName,
      city_id
    );
    res.json({ success: true, village });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await locationModel.deleteVillage(id);
    res.json({ success: true, village });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleVillageActive = async (req, res) => {
  const trx = await pool.connect();
  try {
    await trx.query('BEGIN');

    // Get current state
    const currentQuery = `SELECT is_active FROM location_schema.villages WHERE village_id = $1 FOR UPDATE`;
    const currentResult = await trx.query(currentQuery, [req.params.id]);
    if (currentResult.rows.length === 0) {
      await trx.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Village not found" });
    }

    const newState = !currentResult.rows[0].is_active;

    if (newState) {
      // Enabling - check parent district and city
      const parentResult = await parentCheck('village', req.params.id, trx);
      if (!parentResult.valid) {
        await trx.query('ROLLBACK');
        const inactiveParents = [];
        if (!parentResult.ancestors.district_active) inactiveParents.push(`District "${parentResult.ancestors.district_name}"`);
        if (!parentResult.ancestors.city_active) inactiveParents.push(`City "${parentResult.ancestors.city_name}"`);
        return res.status(400).json({
          success: false,
          message: `Cannot enable village. Please enable the parent ${inactiveParents.join(' and ')} first.`
        });
      }
    } else {
      // Disabling - cascade disable children
      await cascadeDisable('village', req.params.id, trx);
    }

    // Toggle village
    const toggleQuery = `
      UPDATE location_schema.villages
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE village_id = $2
      RETURNING *
    `;
    const result = await trx.query(toggleQuery, [newState, req.params.id]);

    await trx.query('COMMIT');
    res.json({ success: true, village: result.rows[0] });
  } catch (error) {
    await trx.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    trx.release();
  }
};

export const getAllActiveVillages = async (req, res) => {
  try {
    const villages = await locationModel.getAllActiveVillages();
    res.json({ success: true, villages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//PINCODES
export const createPincode = async (req, res) => {
  try {
    const { pincode, village_id } = req.body;

    // Validate input
    if (!pincode || !village_id) {
      return res.status(400).json({
        success: false,
        message: "pincode and village_id are required",
      });
    }

    // Check if pincode already exists for same village
    const existingPincode = await locationModel.getPincodeByValue(
      pincode,
      village_id
    );
    if (existingPincode) {
      return res.status(409).json({
        success: false,
        message: "Pincode already exists for this village",
      });
    }

    // Create pincode
    const newPincode = await locationModel.createPincode(pincode, village_id);

    res.status(201).json({
      success: true,
      pincode: newPincode,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllPincodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await locationModel.getAllPincodes(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.json({ 
      success: true, 
      pincodes: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPincodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const pincode = await locationModel.getPincodeById(id);
    if (!pincode)
      return res
        .status(404)
        .json({ success: false, error: "Pincode not found" });
    res.json({ success: true, pincode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePincode = async (req, res) => {
  try {
    const { id } = req.params;
    const { pincode, village_id } = req.body;

    // Validate input
    if (!pincode || !village_id) {
      return res.status(400).json({
        success: false,
        message: "pincode and village_id are required",
      });
    }

    // Check if pincode already exists for same village (excluding current pincode)
    const existingPincode = await locationModel.getPincodeByValueExcludeId(pincode, village_id, id);
    if (existingPincode) {
      return res.status(409).json({
        success: false,
        message: "Pincode already exists for this village",
      });
    }

    const updatedPincode = await locationModel.updatePincode(
      id,
      pincode,
      village_id
    );
    res.json({ success: true, pincode: updatedPincode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePincode = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPincode = await locationModel.deletePincode(id);
    res.json({ success: true, pincode: deletedPincode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const togglePincodeActive = async (req, res) => {
  const trx = await pool.connect();
  try {
    await trx.query('BEGIN');

    // Get current state
    const currentQuery = `SELECT is_active FROM location_schema.pincodes WHERE pincode_id = $1 FOR UPDATE`;
    const currentResult = await trx.query(currentQuery, [req.params.id]);
    if (currentResult.rows.length === 0) {
      await trx.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Pincode not found" });
    }

    const newState = !currentResult.rows[0].is_active;

    if (newState) {
      // Enabling - check parent district, city, and village
      const parentResult = await parentCheck('pincode', req.params.id, trx);
      if (!parentResult.valid) {
        await trx.query('ROLLBACK');
        const inactiveParents = [];
        if (!parentResult.ancestors.district_active) inactiveParents.push(`District "${parentResult.ancestors.district_name}"`);
        if (!parentResult.ancestors.city_active) inactiveParents.push(`City "${parentResult.ancestors.city_name}"`);
        if (!parentResult.ancestors.village_active) inactiveParents.push(`Village "${parentResult.ancestors.village_name}"`);
        return res.status(400).json({
          success: false,
          message: `Cannot enable pincode. Please enable the parent ${inactiveParents.join(', ')} first.`
        });
      }
    }
    // No cascading disable for pincodes since they have no children

    // Toggle pincode
    const toggleQuery = `
      UPDATE location_schema.pincodes
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE pincode_id = $2
      RETURNING *
    `;
    const result = await trx.query(toggleQuery, [newState, req.params.id]);

    await trx.query('COMMIT');
    res.json({ success: true, pincode: result.rows[0] });
  } catch (error) {
    await trx.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    trx.release();
  }
};


// Get full location hierarchy
export const getHierarchy = async (req, res) => {
  try {
    const hierarchy = await locationModel.getFullHierarchy();
    res.json({ success: true, hierarchy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// BULK DELETE FUNCTIONS

// Bulk delete states
export const bulkDeleteStates = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid state IDs" });
    }

    const result = await pool.query(
      "DELETE FROM location_schema.states WHERE state_id = ANY($1) RETURNING state_id",
      [ids]
    );

    res.json({
      success: true,
      message: "States deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.state_id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk delete districts
export const bulkDeleteDistricts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid district IDs" });
    }

    const result = await pool.query(
      "DELETE FROM location_schema.districts WHERE district_id = ANY($1) RETURNING district_id",
      [ids]
    );

    res.json({
      success: true,
      message: "Districts deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.district_id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk delete cities
export const bulkDeleteCities = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid city IDs" });
    }

    const result = await pool.query(
      "DELETE FROM location_schema.cities WHERE city_id = ANY($1) RETURNING city_id",
      [ids]
    );

    res.json({
      success: true,
      message: "Cities deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.city_id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk delete villages
export const bulkDeleteVillages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid village IDs" });
    }

    const result = await pool.query(
      "DELETE FROM location_schema.villages WHERE village_id = ANY($1) RETURNING village_id",
      [ids]
    );

    res.json({
      success: true,
      message: "Villages deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.village_id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Bulk delete pincodes
export const bulkDeletePincodes = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid pincode IDs" });
    }

    const result = await pool.query(
      "DELETE FROM location_schema.pincodes WHERE pincode_id = ANY($1) RETURNING pincode_id",
      [ids]
    );

    res.json({
      success: true,
      message: "Pincodes deleted successfully",
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.pincode_id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
