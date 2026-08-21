

// const pool = require('../config/db');

// const addDistrict = async (req, res) => {
//   const { name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!name) {
//     return res.status(400).json({ message: 'District name is required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       await pool.query('INSERT INTO countries (name) VALUES ($1)', [country_name]);
//     }
//     const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [country_name])).rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [state_name, countryId]);
//     }
//     const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId])).rows[0].id;

//     // Check if district already exists
//     const districtCheck = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [name, stateId]);
//     if (districtCheck.rows.length > 0) {
//       return res.status(400).json({ message: 'District already exists in this state' });
//     }

//     // Insert district
//     const result = await pool.query(
//       'INSERT INTO districts (name, state_id) VALUES ($1, $2) RETURNING *',
//       [name, stateId]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('district_added', result.rows[0]);

//     res.status(201).json({ message: 'District added successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const editDistrict = async (req, res) => {
//   const { id } = req.params;
//   const { name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!name) {
//     return res.status(400).json({ message: 'District name is required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       return res.status(404).json({ message: 'Country not found' });
//     }
//     const countryId = country.rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       return res.status(404).json({ message: 'State not found' });
//     }
//     const stateId = state.rows[0].id;

//     // Check if district exists
//     const districtCheck = await pool.query('SELECT id FROM districts WHERE id = $1', [id]);
//     if (districtCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'District not found' });
//     }

//     // Update district
//     const result = await pool.query(
//       'UPDATE districts SET name = $1, state_id = $2 WHERE id = $3 RETURNING *',
//       [name, stateId, id]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('district_updated', result.rows[0]);

//     res.status(200).json({ message: 'District updated successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const addCity = async (req, res) => {
//   const { name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!name || !district_name) {
//     return res.status(400).json({ message: 'City name and district name are required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       await pool.query('INSERT INTO countries (name) VALUES ($1)', [country_name]);
//     }
//     const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [country_name])).rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [state_name, countryId]);
//     }
//     const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId])).rows[0].id;

//     // Check if district exists
//     const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [district_name, stateId]);
//     if (district.rows.length === 0) {
//       return res.status(404).json({ message: 'District not found' });
//     }
//     const districtId = district.rows[0].id;

//     // Check if city already exists
//     const cityCheck = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [name, districtId]);
//     if (cityCheck.rows.length > 0) {
//       return res.status(400).json({ message: 'City already exists in this district' });
//     }

//     // Insert city
//     const result = await pool.query(
//       'INSERT INTO cities (name, district_id) VALUES ($1, $2) RETURNING *',
//       [name, districtId]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('city_added', result.rows[0]);

//     res.status(201).json({ message: 'City added successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const editCity = async (req, res) => {
//   const { id } = req.params;
//   const { name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!name || !district_name) {
//     return res.status(400).json({ message: 'City name and district name are required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       return res.status(404).json({ message: 'Country not found' });
//     }
//     const countryId = country.rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       return res.status(404).json({ message: 'State not found' });
//     }
//     const stateId = state.rows[0].id;

//     // Check if district exists
//     const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [district_name, stateId]);
//     if (district.rows.length === 0) {
//       return res.status(404).json({ message: 'District not found' });
//     }
//     const districtId = district.rows[0].id;

//     // Check if city exists
//     const cityCheck = await pool.query('SELECT id FROM cities WHERE id = $1', [id]);
//     if (cityCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'City not found' });
//     }

//     // Update city
//     const result = await pool.query(
//       'UPDATE cities SET name = $1, district_id = $2 WHERE id = $3 RETURNING *',
//       [name, districtId, id]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('city_updated', result.rows[0]);

//     res.status(200).json({ message: 'City updated successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const addPincode = async (req, res) => {
//   const { pincode, city_name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!pincode || !city_name || !district_name) {
//     return res.status(400).json({ message: 'Pincode, city name, and district name are required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       await pool.query('INSERT INTO countries (name) VALUES ($1)', [country_name]);
//     }
//     const countryId = (await pool.query('SELECT id FROM countries WHERE name = $1', [country_name])).rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       await pool.query('INSERT INTO states (name, country_id) VALUES ($1, $2)', [state_name, countryId]);
//     }
//     const stateId = (await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId])).rows[0].id;

//     // Check if district exists
//     const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [district_name, stateId]);
//     if (district.rows.length === 0) {
//       return res.status(404).json({ message: 'District not found' });
//     }
//     const districtId = district.rows[0].id;

//     // Check if city exists
//     const city = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [city_name, districtId]);
//     if (city.rows.length === 0) {
//       return res.status(404).json({ message: 'City not found' });
//     }
//     const cityId = city.rows[0].id;

//     // Check if pincode already exists
//     const pincodeCheck = await pool.query('SELECT id FROM pincodes WHERE pincode = $1', [pincode]);
//     if (pincodeCheck.rows.length > 0) {
//       return res.status(400).json({ message: 'Pincode already exists' });
//     }

//     // Insert pincode
//     const result = await pool.query(
//       'INSERT INTO pincodes (pincode, city_id) VALUES ($1, $2) RETURNING *',
//       [pincode, cityId]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('pincode_added', result.rows[0]);

//     res.status(201).json({ message: 'Pincode added successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const editPincode = async (req, res) => {
//   const { id } = req.params;
//   const { pincode, city_name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
//   if (!pincode || !city_name || !district_name) {
//     return res.status(400).json({ message: 'Pincode, city name, and district name are required' });
//   }

//   try {
//     // Check if country exists
//     const country = await pool.query('SELECT id FROM countries WHERE name = $1', [country_name]);
//     if (country.rows.length === 0) {
//       return res.status(404).json({ message: 'Country not found' });
//     }
//     const countryId = country.rows[0].id;

//     // Check if state exists
//     const state = await pool.query('SELECT id FROM states WHERE name = $1 AND country_id = $2', [state_name, countryId]);
//     if (state.rows.length === 0) {
//       return res.status(404).json({ message: 'State not found' });
//     }
//     const stateId = state.rows[0].id;

//     // Check if district exists
//     const district = await pool.query('SELECT id FROM districts WHERE name = $1 AND state_id = $2', [district_name, stateId]);
//     if (district.rows.length === 0) {
//       return res.status(404).json({ message: 'District not found' });
//     }
//     const districtId = district.rows[0].id;

//     // Check if city exists
//     const city = await pool.query('SELECT id FROM cities WHERE name = $1 AND district_id = $2', [city_name, districtId]);
//     if (city.rows.length === 0) {
//       return res.status(404).json({ message: 'City not found' });
//     }
//     const cityId = city.rows[0].id;

//     // Check if pincode exists
//     const pincodeCheck = await pool.query('SELECT id FROM pincodes WHERE id = $1', [id]);
//     if (pincodeCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'Pincode not found' });
//     }

//     // Update pincode
//     const result = await pool.query(
//       'UPDATE pincodes SET pincode = $1, city_id = $2 WHERE id = $3 RETURNING *',
//       [pincode, cityId, id]
//     );

//     // Emit Socket.IO event
//     req.io.to('super_admins').emit('pincode_updated', result.rows[0]);

//     res.status(200).json({ message: 'Pincode updated successfully', data: result.rows[0] });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = (io) => ({
// addDistrict: (req, res) => addDistrict({ ...req, io }, res),
// editDistrict: (req, res) => editDistrict({ ...req, io }, res),
//   addCity: (req, res) => addCity({ ...req, io }, res),
//   editCity: (req, res) => editCity({ ...req, io }, res),
//   addPincode: (req, res) => addPincode({ ...req, io }, res),
//   editPincode: (req, res) => editPincode({ ...req, io }, res),
// });



const pincodeModule = require('../models/pincodeModule');
const pool = require('../config/db');

const addDistrict = async (req, res) => {
  const { name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'District name is required' });
  }

  try {
    const result = await pincodeModule.addDistrict(name, state_name, country_name);
    req.io.to('super_admins').emit('district_added', result);
    res.status(201).json({ message: 'District added successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const editDistrict = async (req, res) => {
  const { id } = req.params;
  const { name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'District name is required' });
  }

  try {
    const result = await pincodeModule.editDistrict(id, name, state_name, country_name);
    req.io.to('super_admins').emit('district_updated', result);
    res.status(200).json({ message: 'District updated successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const addCity = async (req, res) => {
  const { name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!name || !district_name) {
    return res.status(400).json({ message: 'City name and district name are required' });
  }

  try {
    const result = await pincodeModule.addCity(name, district_name, state_name, country_name);
    req.io.to('super_admins').emit('city_added', result);
    res.status(201).json({ message: 'City added successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const editCity = async (req, res) => {
  const { id } = req.params;
  const { name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!name || !district_name) {
    return res.status(400).json({ message: 'City name and district name are required' });
  }

  try {
    const result = await pincodeModule.editCity(id, name, district_name, state_name, country_name);
    req.io.to('super_admins').emit('city_updated', result);
    res.status(200).json({ message: 'City updated successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const addPincode = async (req, res) => {
  const { pincode, city_name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!pincode || !city_name || !district_name) {
    return res.status(400).json({ message: 'Pincode, city name, and district name are required' });
  }

  try {
    const result = await pincodeModule.addPincode(pincode, city_name, district_name, state_name, country_name);
    req.io.to('super_admins').emit('pincode_added', result);
    res.status(201).json({ message: 'Pincode added successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const editPincode = async (req, res) => {
  const { id } = req.params;
  const { pincode, city_name, district_name, state_name = 'Maharashtra', country_name = 'India' } = req.body;
  if (!pincode || !city_name || !district_name) {
    return res.status(400).json({ message: 'Pincode, city name, and district name are required' });
  }

  try {
    const result = await pincodeModule.editPincode(id, pincode, city_name, district_name, state_name, country_name);
    req.io.to('super_admins').emit('pincode_updated', result);
    res.status(200).json({ message: 'Pincode updated successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

const getDistricts = async (req, res) => {
  try {
    const result = await pincodeModule.getDistricts();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCities = async (req, res) => {
  try {
    const result = await pincodeModule.getCities();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPincodes = async (req, res) => {
  try {
    const result = await pincodeModule.getPincodes();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = (io) => ({
  addDistrict: (req, res) => addDistrict({ ...req, io }, res),
  editDistrict: (req, res) => editDistrict({ ...req, io }, res),
  addCity: (req, res) => addCity({ ...req, io }, res),
  editCity: (req, res) => editCity({ ...req, io }, res),
  addPincode: (req, res) => addPincode({ ...req, io }, res),
  editPincode: (req, res) => editPincode({ ...req, io }, res),
  getDistricts,
  getCities,
  getPincodes,
});