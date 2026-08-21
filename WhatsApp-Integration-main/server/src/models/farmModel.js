import db from "../config/db.js";

const addFarm = async (user_id, farm_name, pincode_id, farm_coordinates, field_id) => {
    const result = await db.query(
        `INSERT INTO farms_schema.farms (user_id, farm_name, pincode_id, farm_coordinates, field_id)
     VALUES ($1, $2, $3, $4::jsonb, $5) RETURNING *`,
        [user_id, farm_name, pincode_id, farm_coordinates, field_id]
    );
    return result.rows[0];
};

const getFarmsByUser = async (user_id) => {
    const result = await db.query(
        `SELECT f.*, 
       p.pincode,
       v.village_name,
       c.city_name,
       d.district_name,
       s.state_name
FROM farms_schema.farms f
LEFT JOIN location_schema.pincodes p ON f.pincode_id = p.pincode_id
LEFT JOIN location_schema.villages v ON p.village_id = v.village_id
LEFT JOIN location_schema.cities c ON v.city_id = c.city_id
LEFT JOIN location_schema.districts d ON c.district_id = d.district_id
LEFT JOIN location_schema.states s ON d.state_id = s.state_id
WHERE f.user_id = $1`,
        [user_id]
    );
    return result.rows;
};

const getAllCrops = async () => {
    const result = await db.query(
        `SELECT id AS crop_id, crop_name, category_id FROM farms_schema.crops ORDER BY id`
    );
    return result.rows;
};

const addFarmCrop = async (farm_id, crop_id, sowing_date) => {
    const result = await db.query(
        `INSERT INTO farms_schema.farm_crops (farm_id, crop_id, sowing_date)
         VALUES ($1, $2, $3) RETURNING *`,
        [farm_id, crop_id, sowing_date]
    );
    return result.rows[0];
};

const getFarmCropsByFarm = async (farm_id) => {
    const result = await db.query(
        `SELECT fc.*, c.crop_name
         FROM farms_schema.farm_crops fc
         JOIN farms_schema.crops c ON fc.crop_id = c.id
         WHERE fc.farm_id = $1`,
        [farm_id]
    );
    return result.rows;
};

const getFarmById = async (farm_id) => {
    const result = await db.query(
        `SELECT f.*, 
       p.pincode,
       v.village_name,
       c.city_name,
       d.district_name,
       s.state_name
FROM farms_schema.farms f
LEFT JOIN location_schema.pincodes p ON f.pincode_id = p.pincode_id
LEFT JOIN location_schema.villages v ON p.village_id = v.village_id
LEFT JOIN location_schema.cities c ON v.city_id = c.city_id
LEFT JOIN location_schema.districts d ON c.district_id = d.district_id
LEFT JOIN location_schema.states s ON d.state_id = s.state_id
WHERE f.id = $1`,
        [farm_id]
    );
    return result.rows[0];
};

export { addFarm, getFarmsByUser, getAllCrops, addFarmCrop, getFarmCropsByFarm, getFarmById };
