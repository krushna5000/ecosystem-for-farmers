

const pool = require('../config/db');

// -------------------- DISTRICTS --------------------

// const addDistrict = async (name, stateName = 'Maharashtra', countryName = 'India') => {
//   try {
//     let country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
//     if (country.rows.length === 0) {
//       await pool.query('INSERT INTO countries (name) VALUES ($1)', [countryName]);
//     }
//     const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [countryName])).rows[0].id;

//     let state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
//     if (state.rows.length === 0) {
//       await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [stateName, countryId]);
//     }
//     const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId])).rows[0].id;

//     const districtCheck = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [name, stateId]);
//     if (districtCheck.rows.length > 0) {
//       throw new Error('District already exists in this state');
//     }

//     const result = await pool.query(
//       'INSERT INTO districts (name, state_id) VALUES ($1, $2) RETURNING *',
//       [name, stateId]
//     );
//     return result.rows[0];
//   } catch (error) {
//     throw error;
//   }
// };

// DISTRICT
const addDistrict = async (name, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    let country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) {
      await pool.query('INSERT INTO countries (name) VALUES ($1)', [countryName]);
    }
    const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [countryName])).rows[0].id;

    let state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) {
      await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [stateName, countryId]);
    }
    const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId])).rows[0].id;

    const districtCheck = await pool.query('SELECT * FROM districts WHERE name = $1 AND state_id = $2', [name, stateId]);
    if (districtCheck.rows.length > 0) {
      return districtCheck.rows[0]; // ✅ Return existing district instead of throwing
    }

    const result = await pool.query(
      'INSERT INTO districts (name, state_id) VALUES ($1, $2) RETURNING *',
      [name, stateId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};


const editDistrict = async (id, name, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    const country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) throw new Error('Country not found');
    const countryId = country.rows[0].id;

    const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) throw new Error('State not found');
    const stateId = state.rows[0].id;

    const districtCheck = await pool.query('SELECT id FROM districts WHERE id = $1', [id]);
    if (districtCheck.rows.length === 0) throw new Error('District not found');

    const result = await pool.query(
      'UPDATE districts SET name = $1, state_id = $2 WHERE id = $3 RETURNING *',
      [name, stateId, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// -------------------- CITIES --------------------

// const addCity = async (name, districtName, stateName = 'Maharashtra', countryName = 'India') => {
//   try {
//     let country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
//     if (country.rows.length === 0) {
//       await pool.query('INSERT INTO countries (name) VALUES ($1)', [countryName]);
//     }
//     const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [countryName])).rows[0].id;

//     let state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
//     if (state.rows.length === 0) {
//       await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [stateName, countryId]);
//     }
//     const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId])).rows[0].id;

//     const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [districtName, stateId]);
//     if (district.rows.length === 0) throw new Error('District not found');
//     const districtId = district.rows[0].id;

//     const cityCheck = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [name, districtId]);
//     if (cityCheck.rows.length > 0) throw new Error('City already exists in this district');

//     const result = await pool.query(
//       'INSERT INTO cities (name, district_id) VALUES ($1, $2) RETURNING *',
//       [name, districtId]
//     );
//     return result.rows[0];
//   } catch (error) {
//     throw error;
//   }
// };
// CITY
const addCity = async (name, districtName, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    let country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) {
      await pool.query('INSERT INTO countries (name) VALUES ($1)', [countryName]);
    }
    const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [countryName])).rows[0].id;

    let state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) {
      await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [stateName, countryId]);
    }
    const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId])).rows[0].id;

    const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [districtName, stateId]);
    if (district.rows.length === 0) throw new Error('District not found');
    const districtId = district.rows[0].id;

    const cityCheck = await pool.query('SELECT * FROM cities WHERE name = $1 AND district_id = $2', [name, districtId]);
    if (cityCheck.rows.length > 0) {
      return cityCheck.rows[0]; // ✅ Return existing city
    }

    const result = await pool.query(
      'INSERT INTO cities (name, district_id) VALUES ($1, $2) RETURNING *',
      [name, districtId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};


const editCity = async (id, name, districtName, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    const country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) throw new Error('Country not found');
    const countryId = country.rows[0].id;

    const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) throw new Error('State not found');
    const stateId = state.rows[0].id;

    const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [districtName, stateId]);
    if (district.rows.length === 0) throw new Error('District not found');
    const districtId = district.rows[0].id;

    const cityCheck = await pool.query('SELECT id FROM cities WHERE id = $1', [id]);
    if (cityCheck.rows.length === 0) throw new Error('City not found');

    const result = await pool.query(
      'UPDATE cities SET name = $1, district_id = $2 WHERE id = $3 RETURNING *',
      [name, districtId, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// -------------------- PINCODES --------------------

const addPincode = async (pincode, cityName, districtName, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    let country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) {
      await pool.query('INSERT INTO countries (name) VALUES ($1)', [countryName]);
    }
    const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [countryName])).rows[0].id;

    let state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) {
      await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [stateName, countryId]);
    }
    const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId])).rows[0].id;

    const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [districtName, stateId]);
    if (district.rows.length === 0) throw new Error('District not found');
    const districtId = district.rows[0].id;

    const city = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [cityName, districtId]);
    if (city.rows.length === 0) throw new Error('City not found');
    const cityId = city.rows[0].id;

    const pincodeCheck = await pool.query('SELECT id FROM pincodes WHERE pincode = $1', [pincode]);
    if (pincodeCheck.rows.length > 0) throw new Error('Pincode already exists');

    const result = await pool.query(
      'INSERT INTO pincodes (pincode, city_id) VALUES ($1, $2) RETURNING *',
      [pincode, cityId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const editPincode = async (id, pincode, cityName, districtName, stateName = 'Maharashtra', countryName = 'India') => {
  try {
    const country = await pool.query('SELECT id FROM countries WHERE name = $1', [countryName]);
    if (country.rows.length === 0) throw new Error('Country not found');
    const countryId = country.rows[0].id;

    const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [stateName, countryId]);
    if (state.rows.length === 0) throw new Error('State not found');
    const stateId = state.rows[0].id;

    const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [districtName, stateId]);
    if (district.rows.length === 0) throw new Error('District not found');
    const districtId = district.rows[0].id;

    const city = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [cityName, districtId]);
    if (city.rows.length === 0) throw new Error('City not found');
    const cityId = city.rows[0].id;

    const pincodeCheck = await pool.query('SELECT id FROM pincodes WHERE id = $1', [id]);
    if (pincodeCheck.rows.length === 0) throw new Error('Pincode not found');

    const result = await pool.query(
      'UPDATE pincodes SET pincode = $1, city_id = $2 WHERE id = $3 RETURNING *',
      [pincode, cityId, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// -------------------- FETCH --------------------

const getDistricts = async () => {
  const result = await pool.query('SELECT * FROM districts');
  return result.rows;
};

const getCities = async () => {
  const result = await pool.query('SELECT * FROM cities');
  return result.rows;
};

const getPincodes = async () => {
  const result = await pool.query(`
    SELECT 
      p.id, p.pincode,
      c.name AS city_name,
      d.name AS district_name,
      s.name AS state_name,
      cn.name AS country_name
    FROM pincodes p
    JOIN cities c ON p.city_id = c.id
    JOIN districts d ON c.district_id = d.id
    JOIN states s ON d.state_id = s.id
    JOIN countries cn ON s.country_id = cn.id
    ORDER BY p.id DESC
  `);
  return result.rows;
};

module.exports = {
  addDistrict,
  editDistrict,
  addCity,
  editCity,
  addPincode,
  editPincode,
  getDistricts,
  getCities,
  getPincodes,
};
