// Business rules for crop stages. Throws AppError subclasses; never runs queries itself.
// `db` is imported only to open the transactions below — the queries live in the factory.
import { db } from "../../db/connection.js";
import {
  createCropStageInDB,
  getCropStageByNameInDB,
  listCropStagesInDB,
  getCropStageByIdInDB,
  updateCropStageInDB,
  removeStageFromCropsInDB,
  deleteCropStageInDB,
  bulkDeleteCropStagesInDB,
} from "./superAdminCropStage.factory.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";
import { isUniqueViolation } from "../../errors/dbError.js";
import { buildPagination } from "../../utils/superAdminPagination.js";

const NAME_TAKEN = "Stage name already exists";

export async function createCropStage({ stage_name, description }) {
  if (await getCropStageByNameInDB(stage_name)) throw new ConflictError("Crop stage already exists");

  try {
    return await createCropStageInDB({ stageName: stage_name, description: description ?? null });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ConflictError(NAME_TAKEN);
    throw err;
  }
}

export async function listCropStages({ page, limit }) {
  const { rows, total } = await listCropStagesInDB({ limit, offset: (page - 1) * limit });
  return { rows, pagination: buildPagination(page, limit, total) };
}

export async function getCropStageById(id) {
  const stage = await getCropStageByIdInDB(id);
  if (!stage) throw new NotFoundError("Crop stage not found");
  return stage;
}

export async function updateCropStage(id, { stage_name, description }) {
  let stage;
  try {
    stage = await updateCropStageInDB(id, { stageName: stage_name, description: description ?? null });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ConflictError(NAME_TAKEN);
    throw err;
  }
  if (!stage) throw new NotFoundError("Crop stage not found");
  return stage;
}

// Deleting a stage first strips it from every crop's jsonb stage array — one transaction.
// The 404 is raised after the transaction, like the legacy handler (the cleanup is committed either way).
export async function deleteCropStage(id) {
  const deleted = await db.transaction(async (tx) => {
    await removeStageFromCropsInDB(id, tx);
    return deleteCropStageInDB(id, tx);
  });
  if (!deleted) throw new NotFoundError("Crop stage not found");
}

export async function bulkDeleteCropStages(ids) {
  const deletedIds = await db.transaction(async (tx) => {
    for (const id of ids) {
      await removeStageFromCropsInDB(id, tx);
    }
    return bulkDeleteCropStagesInDB(ids, tx);
  });
  if (deletedIds.length === 0) throw new NotFoundError("No crop stages found with provided IDs");
  return { deletedCount: deletedIds.length, deletedIds };
}
