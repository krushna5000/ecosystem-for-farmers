import pool from "../../config/db.js";

const getCropById = async (crop_id) => {
  try {
    const query = `
      SELECT
        c.id,
        c.crop_name,
        c.t_base,
        c.created_at,

        cat.id AS category_id,
        cat.category_name,

        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', (stg->>'id')::int,
              'stage_name', s.stage_name,
              'das_min', (stg->>'das_min')::int,
              'das_max', (stg->>'das_max')::int,
              'gdd_min', (stg->>'gdd_min')::int,
              'gdd_max', (stg->>'gdd_max')::int
            )
          ) FILTER (WHERE stg IS NOT NULL),
          '[]'::jsonb
        ) AS crop_stages

      FROM farms_schema.crops c

      LEFT JOIN farms_schema.crop_categories cat
        ON cat.id = c.category_id

      LEFT JOIN LATERAL jsonb_array_elements(
        COALESCE(c.crop_stage_id, '[]'::jsonb)
      ) AS stg ON TRUE

      LEFT JOIN farms_schema.crop_stages s
        ON s.id = (stg->>'id')::int

      WHERE c.id = $1

      GROUP BY c.id, cat.id
    `;

    const result = await pool.query(query, [crop_id]);

    return result.rows[0] || null;
  } catch (err) {
    console.error("getCropById:", err.message);
    throw err;
  }
};

const getFarmCrop = async (farm_id, crop_id) => {
  const result = await db.query(
    `SELECT 
        fc.*, 
        c.crop_name
     FROM farms_schema.farm_crops fc
     JOIN farms_schema.crops c 
        ON fc.crop_id = c.id
     WHERE fc.farm_id = $1 
     AND fc.crop_id = $2`,
    [farm_id, crop_id],
  );

  return result.rows[0] || null;
};

export default {
  getCropById,
  getFarmCrop,
};
