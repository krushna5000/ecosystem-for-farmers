// Business rules for the super admin crop catalogue. Throws AppError subclasses; never touches the HTTP request/response or db.
import {
  categoryExistsInDB,
  cropExistsInDB,
  createCropInDB,
  getCropByIdInDB,
  updateCropInDB,
  deleteCropInDB,
  findExistingCropIdsInDB,
  bulkDeleteCropsInDB,
  listCropsInDB,
} from "./superAdminCrop.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { buildPagination } from "../../utils/superAdminPagination.js";

// Add-crop validation failures answer `{ success, message, error }` — pin that exact body.
const addCropError = (message, error) =>
  new BadRequestError(message, { body: { success: false, message, error } });

export async function createCrop({ category_id, crop_name, crop_stages_id, t_base }) {
  if (!category_id || !crop_name) {
    throw addCropError("Required fields are missing", " category_id & crop_name are required");
  }

  if (crop_stages_id && !Array.isArray(crop_stages_id)) {
    throw addCropError("Invalid crop_stages_id", "crop_stages_id must be an array");
  }

  if (!(await categoryExistsInDB(category_id))) throw new NotFoundError("Invalid category_id");

  return createCropInDB({
    categoryId: category_id,
    cropName: crop_name,
    cropStageId: crop_stages_id || null,
    tBase: t_base ?? null,
  });
}

// COALESCE semantics of the original UPDATE: only fields that are provided (non-null) are changed;
// crop_stages_id must also be truthy.
export async function updateCrop(id, body = {}) {
  if (!(await cropExistsInDB(id))) throw new NotFoundError("Crop not found");

  const changes = {};
  if (body.category_id != null) changes.categoryId = body.category_id;
  if (body.crop_name != null) changes.cropName = body.crop_name;
  if (body.crop_stages_id) changes.cropStageId = body.crop_stages_id;
  if (body.t_base != null) changes.tBase = body.t_base;

  if (Object.keys(changes).length === 0) return getCropByIdInDB(id);
  return updateCropInDB(id, changes);
}

export async function deleteCrop(id) {
  if (!(await cropExistsInDB(id))) throw new NotFoundError("Crop not found");
  await deleteCropInDB(id);
}

export async function listCrops({ page, limit }) {
  const { rows, total } = await listCropsInDB({ limit, offset: (page - 1) * limit });
  return { rows, pagination: buildPagination(page, limit, total) };
}

export async function bulkDeleteCrops(ids) {
  const existing = await findExistingCropIdsInDB(ids);
  if (existing.length === 0) throw new NotFoundError("No crops found with provided IDs");

  const deletedIds = await bulkDeleteCropsInDB(ids);
  return { deletedCount: deletedIds.length, deletedIds };
}
