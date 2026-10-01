import { eq, asc, count, inArray, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { cropStages } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";

// Removes a stage ({ id }) from every crop's jsonb `crop_stage_id` array.
const removeStageFromCrops = (tx, id) =>
  tx.execute(sql`
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

export const createCropStage = async (stage_name, description) => {
  const [row] = await db
    .insert(cropStages)
    .values({ stageName: stage_name, description: description ?? null })
    .returning();
  return snakeKeys(row);
};

// Case-insensitive lookup used for the duplicate check on create.
export const getCropStageByName = async (stage_name) => {
  const [row] = await db
    .select()
    .from(cropStages)
    .where(sql`lower(${cropStages.stageName}) = lower(${stage_name})`)
    .limit(1);
  return snakeKeys(row) || null;
};

export const getAllCropStages = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const rows = await db
    .select()
    .from(cropStages)
    .orderBy(asc(cropStages.createdAt))
    .limit(limit)
    .offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(cropStages);

  return { data: snakeRows(rows), total };
};

export const getCropStageById = async (id) => {
  const [row] = await db.select().from(cropStages).where(eq(cropStages.id, id));
  return snakeKeys(row) || null;
};

export const updateCropStageById = async (id, stage_name, description) => {
  const [row] = await db
    .update(cropStages)
    .set({ stageName: stage_name, description: description ?? null })
    .where(eq(cropStages.id, id))
    .returning();
  return snakeKeys(row) || null;
};

// Returns the number of deleted rows.
export const deleteCropStageById = (id) =>
  db.transaction(async (tx) => {
    await removeStageFromCrops(tx, id);
    const rows = await tx.delete(cropStages).where(eq(cropStages.id, id)).returning({ id: cropStages.id });
    return rows.length;
  });

export const bulkDeleteCropStages = (ids) =>
  db.transaction(async (tx) => {
    for (const id of ids) {
      await removeStageFromCrops(tx, id);
    }
    const rows = await tx
      .delete(cropStages)
      .where(inArray(cropStages.id, ids))
      .returning({ id: cropStages.id });
    return {
      deletedCount: rows.length,
      deletedIds: rows.map((row) => row.id),
    };
  });
