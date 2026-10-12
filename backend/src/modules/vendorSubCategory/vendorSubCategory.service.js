// Business rules for vendor sub-categories. Throws AppError subclasses; never touches the HTTP request or response or db directly.
import {
  brandBelongsToVendorInDB,
  categoryBelongsToVendorInDB,
  subCategoryNameExistsInDB,
  createVendorSubCategoryInDB,
  listVendorSubCategoriesInDB,
  vendorSubCategoryExistsInDB,
  updateVendorSubCategoryInDB,
  toggleVendorSubCategoryStatusInDB,
  deleteVendorSubCategoryInDB,
  bulkDeleteVendorSubCategoriesInDB,
} from "./vendorSubCategory.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { toBoolean, paginationMeta, parseIdList } from "../../utils/vendorHelpers.js";

export async function createVendorSubCategory(vendorId, { brand_id, category_id, sub_category_name }) {
  if (!(await brandBelongsToVendorInDB(brand_id, vendorId))) {
    throw new BadRequestError("Invalid brand_id for this vendor");
  }

  if (!(await categoryBelongsToVendorInDB(category_id, vendorId))) {
    throw new BadRequestError("Invalid category_id for this vendor");
  }

  if (await subCategoryNameExistsInDB(vendorId, brand_id, category_id, sub_category_name)) {
    throw new BadRequestError("Sub-category already exists under this brand & category");
  }

  return createVendorSubCategoryInDB({
    vendorId,
    brandId: brand_id,
    categoryId: category_id,
    subCategoryName: sub_category_name,
  });
}

export async function listVendorSubCategories(vendorId, { page, limit }) {
  const { total, rows } = await listVendorSubCategoriesInDB(vendorId, { limit, offset: (page - 1) * limit });
  return { rows, pagination: paginationMeta(total, page, limit) };
}

export async function updateVendorSubCategory(id, vendorId, { brand_id, category_id, sub_category_name, status }) {
  if (!(await vendorSubCategoryExistsInDB(id, vendorId))) throw new NotFoundError("Sub-category not found");

  // Only provided fields change.
  const changes = {};
  if (brand_id) changes.brandId = brand_id;
  if (category_id) changes.categoryId = category_id;
  if (sub_category_name) changes.subCategoryName = sub_category_name;
  if (status != null) changes.status = toBoolean(status);

  return updateVendorSubCategoryInDB(id, vendorId, changes);
}

export async function toggleVendorSubCategoryStatus(id) {
  const updated = await toggleVendorSubCategoryStatusInDB(id);
  if (!updated) throw new NotFoundError("Sub-category not found");
  return updated;
}

export async function deleteVendorSubCategory(id, vendorId) {
  const deleted = await deleteVendorSubCategoryInDB(id, vendorId);
  if (!deleted) throw new NotFoundError("Sub-category not found");
  return deleted;
}

export async function deleteVendorSubCategories(vendorId, rawIds) {
  const ids = parseIdList(rawIds);
  if (ids.length === 0) throw new BadRequestError("No valid sub-category IDs provided");

  const deleted = await bulkDeleteVendorSubCategoriesInDB(vendorId, ids);
  return { deletedCount: deleted.length, deletedIds: ids };
}
