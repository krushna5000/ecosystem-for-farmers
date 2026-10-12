// Business rules for vendor categories. Throws AppError subclasses; never touches the HTTP request or response or db directly.
import {
  brandBelongsToVendorInDB,
  categoryNameExistsInDB,
  otherCategoryWithNameInDB,
  createVendorCategoryInDB,
  listVendorCategoriesInDB,
  getVendorCategoryByIdInDB,
  updateVendorCategoryInDB,
  toggleVendorCategoryStatusInDB,
  deleteVendorCategoryInDB,
  bulkDeleteVendorCategoriesInDB,
} from "./vendorCategory.factory.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../errors/index.js";
import { paginationMeta, parseIdList } from "../../utils/vendorHelpers.js";

const INVALID_BRAND = "Invalid brand_id or brand does not belong to this vendor";

export async function createVendorCategory(vendorId, { brand_id, category_name }) {
  if (!(await brandBelongsToVendorInDB(brand_id, vendorId))) throw new BadRequestError(INVALID_BRAND);

  if (await categoryNameExistsInDB(vendorId, brand_id, category_name)) {
    throw new ConflictError("Category already exists under this brand");
  }

  return createVendorCategoryInDB({ vendorId, brandId: brand_id, categoryName: category_name });
}

export async function listVendorCategories(vendorId, { page, limit }) {
  const { total, rows } = await listVendorCategoriesInDB(vendorId, { limit, offset: (page - 1) * limit });
  return { rows, pagination: paginationMeta(total, page, limit) };
}

export async function getVendorCategoryById(id, vendorId) {
  const category = await getVendorCategoryByIdInDB(id, vendorId);
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function updateVendorCategory(id, vendorId, { brand_id, category_name }) {
  await getVendorCategoryById(id, vendorId);

  if (!(await brandBelongsToVendorInDB(brand_id, vendorId))) throw new BadRequestError(INVALID_BRAND);

  if (await otherCategoryWithNameInDB(vendorId, brand_id, category_name, id)) {
    throw new ConflictError("Another category with this name already exists under this brand");
  }

  return updateVendorCategoryInDB(id, vendorId, { brandId: brand_id, categoryName: category_name });
}

export async function toggleVendorCategoryStatus(id, vendorId) {
  const toggled = await toggleVendorCategoryStatusInDB(id, vendorId);
  if (!toggled) throw new NotFoundError("Category not found");
}

export async function deleteVendorCategory(id, vendorId) {
  const deleted = await deleteVendorCategoryInDB(id, vendorId);
  if (!deleted) throw new NotFoundError("Category not found");
  return deleted;
}

export async function deleteVendorCategories(vendorId, rawIds) {
  const ids = parseIdList(rawIds);
  if (ids.length === 0) throw new BadRequestError("No valid category IDs provided");

  const deleted = await bulkDeleteVendorCategoriesInDB(vendorId, ids);
  return { deletedCount: deleted.length, deletedIds: ids };
}
