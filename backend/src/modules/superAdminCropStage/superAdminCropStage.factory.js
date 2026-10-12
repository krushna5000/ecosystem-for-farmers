// Pure DB I/O for farms_schema.crop_stages. No business rules, no HTTP types.
import { eq, asc, count, inArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { cropStages } from "./superAdminCropStage.schema.js";

const exec = (tx) => tx ?? db;

export async function createCropStageInDB(values, tx) {
  const [row] = await exec(tx).insert(cropStages).values(values).returning();
  return row;
}

/** Case-insensitive lookup used for the duplicate check on create. */
export async function getCropStageByNameInDB(stageName, tx) {
  const [row] = await exec(tx)
    .select()
    .from(cropStages)
    .where(sql`lower(${cropStages.stageName}) = lower(${stageName})`)
    .limit(1);
  return row ?? null;
}

export async function listCropStagesInDB({ limit, offset }, tx) {
  const rows = await exec(tx)
    .select()
    .from(cropStages)
    .orderBy(asc(cropStages.createdAt))
    .limit(limit)
    .offset(offset);
  const [{ total }] = await exec(tx).select({ total: count() }).from(cropStages);

  return { rows, total };
}

export async function getCropStageByIdInDB(id, tx) {
  const [row] = await exec(tx).select().from(cropStages).where(eq(cropStages.id, id));
  return row ?? null;
}

export async function updateCropStageInDB(id, changes, tx) {
  const [row] = await exec(tx).update(cropStages).set(changes).where(eq(cropStages.id, id)).returning();
  return row ?? null;
}

/**
 * Removes a stage ({ id }) from every crop's jsonb `crop_stage_id` array.
 * (An array that ends up empty becomes NULL — jsonb_agg of nothing.)
 */
export function removeStageFromCropsInDB(id, tx) {
  return exec(tx).execute(sql`
    UPDATE farms_schema.crops
    SET crop_stage_id = (
      SELECT jsonb_agg(e)
      FROM jsonb_array_elements(crop_stage_id) e
      WHERE (e->>'id')::int <> ${id}::int
    )
    WHERE crop_stage_id @> jsonb_build_array(
      jsonb_build_object('id', ${id}::int)
    )
  `);
}

export async function deleteCropStageInDB(id, tx) {
  const [row] = await exec(tx).delete(cropStages).where(eq(cropStages.id, id)).returning({ id: cropStages.id });
  return row ?? null;
}

/** Returns the ids that were deleted. */
export async function bulkDeleteCropStagesInDB(ids, tx) {
  const rows = await exec(tx)
    .delete(cropStages)
    .where(inArray(cropStages.id, ids))
    .returning({ id: cropStages.id });
  return rows.map((row) => row.id);
}
