import db from "../config/db.js";

// Farm Model Functions
const addFarm = async (
  user_id,
  farm_name,
  pincode_id,
  farm_coordinates,
  field_id
) => {
  const result = await db.query(
    `INSERT INTO farms_schema.farms (user_id, farm_name, pincode_id, farm_coordinates, field_id)
     VALUES ($1, $2, $3, $4::jsonb,$5) RETURNING *`,
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
WHERE f.user_id = $1;

`,
    [user_id]
  );
  return result.rows;
};

const getFarmById = async (farm_id) => {
  const result = await db.query(
    `SELECT 
        f.id,
        f.farm_name,
        f.created_at,
        f.user_id,
        f.pincode_id,
        f.farm_coordinates,
        f.field_id,
        p.pincode,
        v.village_name,
        c.city_name,
        d.district_name,
        s.state_name
     FROM farms_schema.farms f
     LEFT JOIN location_schema.pincodes p 
       ON f.pincode_id = p.pincode_id
     LEFT JOIN location_schema.villages v 
       ON p.village_id = v.village_id
     LEFT JOIN location_schema.cities c 
       ON v.city_id = c.city_id
     LEFT JOIN location_schema.districts d 
       ON c.district_id = d.district_id
     LEFT JOIN location_schema.states s 
       ON d.state_id = s.state_id
     WHERE f.id = $1`,
    [farm_id]
  );
  return result.rows[0];
};

// Get all farms (for cron job)
const getAllFarms = async () => {
  const result = await db.query(
    `SELECT 
        f.id,
        f.farm_name,
        f.created_at,
        f.user_id,
        f.pincode_id,
        f.farm_coordinates,
        f.field_id,
        p.pincode,
        v.village_name,
        c.city_name,
        d.district_name,
        s.state_name
     FROM farms_schema.farms f
     LEFT JOIN location_schema.pincodes p 
       ON f.pincode_id = p.pincode_id
     LEFT JOIN location_schema.villages v 
       ON p.village_id = v.village_id
     LEFT JOIN location_schema.cities c 
       ON v.city_id = c.city_id
     LEFT JOIN location_schema.districts d 
       ON c.district_id = d.district_id
     LEFT JOIN location_schema.states s 
       ON d.state_id = s.state_id`
  );
  return result.rows;
};

const updateFarm = async (farm_id, farm_name, pincode_id, farm_coordinates) => {
  const result = await db.query(
    `UPDATE farms_schema.farms
SET farm_name = COALESCE($1, farm_name),
    pincode_id = COALESCE($2, pincode_id),
     farm_coordinates = COALESCE($3::jsonb, farm_coordinates),
WHERE id = $5
RETURNING *;

`,
    [
      farm_name,
      pincode_id,
      farm_coordinates ? JSON.stringify(farm_coordinates) : null,
      farm_id,
    ]
  );
  return result.rows[0];
};

const deleteFarm = async (farm_id) => {
  const result = await db.query(
    `DELETE FROM farms_schema.farms WHERE id = $1 RETURNING *`,
    [farm_id]
  );
  return result.rows[0];
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
WHERE fc.farm_id = $1;
`,
    [farm_id]
  );
  return result.rows;
};

const getFarmCropById = async (id) => {
  const result = await db.query(
    `SELECT fc.*, c.crop_name
     FROM farms_schema.farm_crops fc
     JOIN farms_schema.crops c ON fc.crop_id = c.id
     WHERE fc.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateFarmCrop = async (id, sowing_date) => {
  console.log(id, sowing_date);
  const result = await db.query(
    `UPDATE farms_schema.farm_crops
     SET sowing_date = COALESCE($1, sowing_date), updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [sowing_date, id]
  );
  return result.rows[0];
};

const deleteFarmCrop = async (id) => {
  const result = await db.query(
    `DELETE FROM farms_schema.farm_crops WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

const getAllActivePincodes = async () => {
  const query = `SELECT pincode_id, pincode
FROM location_schema.pincodes
WHERE is_active = true
ORDER BY pincode_id;
`;
  const result = await db.query(query);
  return result.rows;
};

const getFarmCropsByUser = async (user_id) => {
  const query = `
SELECT
    fc.id AS farm_crop_id,
    fc.farm_id,
    f.farm_name,
    fc.crop_id,
    c.crop_name,
    fc.sowing_date
FROM farms_schema.farm_crops fc
INNER JOIN farms_schema.farms f
    ON fc.farm_id = f.id
INNER JOIN farms_schema.crops c
    ON fc.crop_id = c.id
WHERE f.user_id = $1
ORDER BY fc.id;

  `;

  const result = await db.query(query, [Number(user_id)]);
  return result.rows;
};

const getAllCrops = async () => {
  const query = `
SELECT
    c.id AS crop_id,
    c.crop_name,
    c.category_id,
    cat.category_name,
    COALESCE(cs.crop_stages, '[]') AS crop_stages
FROM farms_schema.crops c
LEFT JOIN farms_schema.crop_categories cat
    ON cat.id = c.category_id
LEFT JOIN (
    SELECT
        c2.id AS crop_id,
        json_agg(
            jsonb_build_object(
                'stage_id', s.id,
                'stage_name', s.stage_name,
                'days', stg->>'days',
                'weeks', stg->>'weeks'
            )
        ) AS crop_stages
    FROM farms_schema.crops c2
    JOIN jsonb_array_elements(c2.crop_stage_id) AS stg ON TRUE
    JOIN farms_schema.crop_stages s
        ON s.id = (stg->>'id')::INT
    GROUP BY c2.id
) cs ON cs.crop_id = c.id
ORDER BY c.id;


  `;
  const result = await db.query(query);
  return result.rows;
};

// Updating field id got from Farmonaut_API
const updateFarmFieldId = async (farm_id, field_id) => {
  const result = await db.query(
    `
    UPDATE farms_schema.farms
    SET field_id = $1
    WHERE id = $2
    RETURNING *;
    `,
    [field_id, farm_id]
  );

  return result.rows[0];
};

export {
  addFarm,
  getFarmsByUser,
  getFarmById,
  getAllFarms,
  updateFarm,
  deleteFarm,
  addFarmCrop,
  getFarmCropsByFarm,
  getFarmCropById,
  updateFarmCrop,
  deleteFarmCrop,
  getAllActivePincodes,
  getFarmCropsByUser,
  getAllCrops,
  updateFarmFieldId,
};
