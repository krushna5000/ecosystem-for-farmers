// Business rules for company sub-categories. Throws AppError subclasses; never touches req/res or db directly.
import {
  findOwnedBrandInDB,
  findOwnedCategoryInDB,
  subCategoryNameExistsInDB,
  createCompanySubCategoryInDB,
  listCompanySubCategoryOptionsInDB,
  countCompanySubCategoriesInDB,
  listCompanySubCategoriesInDB,
  getCompanySubCategoryByIdInDB,
  updateCompanySubCategoryInDB,
  toggleCompanySubCategoryStatusInDB,
  deleteCompanySubCategoryInDB,
  deleteCompanySubCategoriesInDB,
} from "./companySubCategory.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";
import { toBool } from "../../utils/companyHelpers.js";

export async function createCompanySubCategory(
  companyId,
  { brand_id, category_id, sub_category_name },
) {
  if (!(await findOwnedBrandInDB(brand_id, companyId))) {
    throw new BadRequestError("Invalid brand_id for this company");
  }

  if (!(await findOwnedCategoryInDB(category_id, companyId))) {
    throw new BadRequestError("Invalid category_id for this company");
  }

  if (await subCategoryNameExistsInDB(companyId, brand_id, category_id, sub_category_name)) {
    throw new BadRequestError("Sub-category already exists under this brand & category");
  }

  return createCompanySubCategoryInDB({
    companyId,
    brandId: brand_id,
    categoryId: category_id,
    subCategoryName: sub_category_name,
  });
}

export function listCompanySubCategoryOptions(companyId) {
  return listCompanySubCategoryOptionsInDB(companyId);
}

export async function listCompanySubCategories(companyId, { page, limit }) {
  const totalItems = await countCompanySubCategoriesInDB(companyId);
  const rows = await listCompanySubCategoriesInDB(companyId, {
    limit,
    offset: pageOffset(page, limit),
  });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}

export async function getCompanySubCategoryById(id, companyId) {
  const subCategory = await getCompanySubCategoryByIdInDB(id, companyId);
  if (!subCategory) throw new NotFoundError("Sub-category not found");
  return subCategory;
}

export async function updateCompanySubCategory(
  id,
  companyId,
  { brand_id, category_id, sub_category_name, status },
) {
  await getCompanySubCategoryById(id, companyId);

  // Only the provided fields change.
  const changes = {};
  if (brand_id) changes.brandId = brand_id;
  if (category_id) changes.categoryId = category_id;
  if (sub_category_name) changes.subCategoryName = sub_category_name;
  if (status != null) changes.status = toBool(status);

  return updateCompanySubCategoryInDB(id, companyId, changes);
}

export async function toggleCompanySubCategoryStatus(id, companyId) {
  await getCompanySubCategoryById(id, companyId);
  return toggleCompanySubCategoryStatusInDB(id, companyId);
}

export async function deleteCompanySubCategory(id, companyId) {
  const deleted = await deleteCompanySubCategoryInDB(id, companyId);
  if (!deleted) throw new NotFoundError("Sub-category not found");
  return deleted;
}

export async function deleteCompanySubCategories(companyId, ids) {
  const deleted = await deleteCompanySubCategoriesInDB(companyId, ids);
  if (deleted.length === 0) throw new NotFoundError("No sub-categories found to delete");
  return deleted;
}
