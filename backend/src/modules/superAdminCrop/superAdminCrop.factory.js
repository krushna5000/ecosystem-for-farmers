// Pure DB I/O for farms_schema.crops. No business rules, no HTTP types.
import { eq, count, inArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { crops, cropCategories } from "./superAdminCrop.schema.js";

const exec = (tx) => tx ?? db;

export async function categoryExistsInDB(categoryId, tx) {
  const rows = await exec(tx)
    .select({ id: cropCategories.id })
    .from(cropCategories)
    .where(eq(cropCategories.id, categoryId));
  return rows.length > 0;
}

export async function cropExistsInDB(id, tx) {
  const rows = await exec(tx).select({ id: crops.id }).from(crops).where(eq(crops.id, id));
  return rows.length > 0;
}

export async function createCropInDB(values, tx) {
  const [row] = await exec(tx).insert(crops).values(values).returning();
  return row;
}

export async function getCropByIdInDB(id, tx) {
  const [row] = await exec(tx).select().from(crops).where(eq(crops.id, id));
  return row ?? null;
}

export async function updateCropInDB(id, changes, tx) {
  const [row] = await exec(tx).update(crops).set(changes).where(eq(crops.id, id)).returning();
  return row ?? null;
}

export async function deleteCropInDB(id, tx) {
  await exec(tx).delete(crops).where(eq(crops.id, id));
}

export function findExistingCropIdsInDB(ids, tx) {
  return exec(tx).select({ id: crops.id }).from(crops).where(inArray(crops.id, ids));
}

/** Returns the ids that were deleted. */
export async function bulkDeleteCropsInDB(ids, tx) {
  const rows = await exec(tx).delete(crops).where(inArray(crops.id, ids)).returning({ id: crops.id });
  return rows.map((row) => row.id);
}

/**
 * One page of crops with their category and the stage rows resolved from the jsonb `crop_stage_id`
 * array (jsonb_array_elements LATERAL join on crop_stages). Rows come back snake_case from the raw SQL.
 */
export async function listCropsInDB({ limit, offset }, tx) {
  const [{ total }] = await exec(tx).select({ total: count() }).from(crops);

  const result = await exec(tx).execute(sql`
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
}
