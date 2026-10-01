import { eq, count, inArray, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { crops, cropCategories } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../lib/rowCase.js";

export const categoryExists = async (categoryId) => {
  const rows = await db
    .select({ id: cropCategories.id })
    .from(cropCategories)
    .where(eq(cropCategories.id, categoryId));
  return rows.length > 0;
};

export const cropExists = async (id) => {
  const rows = await db.select({ id: crops.id }).from(crops).where(eq(crops.id, id));
  return rows.length > 0;
};

export const createCrop = async ({ category_id, crop_name, crop_stages_id, t_base }) => {
  const [row] = await db
    .insert(crops)
    .values({
      categoryId: category_id,
      cropName: crop_name,
      cropStageId: crop_stages_id || null,
      tBase: t_base ?? null,
    })
    .returning();
  return snakeKeys(row);
};

// COALESCE semantics of the original UPDATE: only fields that are provided
// (non-null) are changed; crop_stages_id must also be truthy.
export const updateCrop = async (id, body) => {
  const changes = {};
  if (body.category_id != null) changes.categoryId = body.category_id;
  if (body.crop_name != null) changes.cropName = body.crop_name;
  if (body.crop_stages_id) changes.cropStageId = body.crop_stages_id;
  if (body.t_base != null) changes.tBase = body.t_base;

  if (Object.keys(changes).length === 0) {
    const [row] = await db.select().from(crops).where(eq(crops.id, id));
    return snakeKeys(row);
  }

  const [row] = await db.update(crops).set(changes).where(eq(crops.id, id)).returning();
  return snakeKeys(row);
};

export const deleteCrop = (id) => db.delete(crops).where(eq(crops.id, id));

export const findExistingCropIds = (ids) =>
  db.select({ id: crops.id }).from(crops).where(inArray(crops.id, ids));

export const bulkDeleteCrops = async (ids) => {
  const rows = await db.delete(crops).where(inArray(crops.id, ids)).returning({ id: crops.id });
  return rows.map((row) => row.id);
};

// Crops with their category and the stage rows resolved from the jsonb
// `crop_stage_id` array (jsonb_array_elements LATERAL join on crop_stages).
export const getAllCrops = async (page, limit) => {
  const offset = (page - 1) * limit;

  const [{ total }] = await db.select({ total: count() }).from(crops);

  const result = await db.execute(sql`
    SELECT
      c.id,
      c.crop_name,
      c.t_base,
      c.created_at,
      c.crop_stage_id,

      cat.id AS category_id,
      cat.category_name,

      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'stage_name', s.stage_name,
            'description', s.description
          )
        )
        FILTER (WHERE s.id IS NOT NULL),
        '[]'::jsonb
      ) AS crop_stages

    FROM farms_schema.crops c

    LEFT JOIN farms_schema.crop_categories cat
      ON cat.id = c.category_id

    LEFT JOIN LATERAL (
      SELECT (e->>'id')::int AS stage_id
      FROM jsonb_array_elements(
        COALESCE(c.crop_stage_id, '[]'::jsonb)
      ) e
    ) stg ON TRUE

    LEFT JOIN farms_schema.crop_stages s
      ON s.id = stg.stage_id

    GROUP BY c.id, cat.id
    ORDER BY c.id ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return { rows: result.rows, total };
};
