// Business rules for company categories. Throws AppError subclasses; never touches req/res or db directly.
import {
  findOwnedBrandInDB,
  categoryNameExistsInDB,
  otherCategoryNamedInDB,
  createCompanyCategoryInDB,
  listCompanyCategoryOptionsInDB,
  countCompanyCategoriesInDB,
  listCompanyCategoriesInDB,
  getCompanyCategoryByIdInDB,
  updateCompanyCategoryInDB,
  toggleCompanyCategoryStatusInDB,
  deleteCompanyCategoryInDB,
  deleteCompanyCategoriesInDB,
} from "./companyCategory.factory.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../errors/index.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";

const INVALID_BRAND = "Invalid brand_id or brand does not belong to this company";

export async function createCompanyCategory(companyId, { brand_id, category_name }) {
  if (!(await findOwnedBrandInDB(brand_id, companyId))) throw new BadRequestError(INVALID_BRAND);

  if (await categoryNameExistsInDB(companyId, brand_id, category_name)) {
    throw new ConflictError("Category already exists under this brand");
  }

  return createCompanyCategoryInDB({ companyId, brandId: brand_id, categoryName: category_name });
}

export function listCompanyCategoryOptions(companyId) {
  return listCompanyCategoryOptionsInDB(companyId);
}

export async function listCompanyCategories(companyId, { page, limit }) {
  const totalItems = await countCompanyCategoriesInDB(companyId);
  const rows = await listCompanyCategoriesInDB(companyId, { limit, offset: pageOffset(page, limit) });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}

export async function getCompanyCategoryById(id, companyId) {
  const category = await getCompanyCategoryByIdInDB(id, companyId);
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function updateCompanyCategory(id, companyId, { brand_id, category_name }) {
  await getCompanyCategoryById(id, companyId);

  if (!(await findOwnedBrandInDB(brand_id, companyId))) throw new BadRequestError(INVALID_BRAND);

  if (await otherCategoryNamedInDB(companyId, brand_id, category_name, id)) {
    throw new ConflictError("Another category with this name already exists under this brand");
  }

  return updateCompanyCategoryInDB(id, companyId, { brandId: brand_id, categoryName: category_name });
}

export async function toggleCompanyCategoryStatus(id, companyId) {
  await getCompanyCategoryById(id, companyId);
  await toggleCompanyCategoryStatusInDB(id, companyId);
}

export async function deleteCompanyCategory(id, companyId) {
  const deleted = await deleteCompanyCategoryInDB(id, companyId);
  if (!deleted) throw new NotFoundError("Category not found");
  return deleted;
}

export async function deleteCompanyCategories(companyId, ids) {
  const deleted = await deleteCompanyCategoriesInDB(companyId, ids);
  if (deleted.length === 0) throw new NotFoundError("No categories found to delete");
  return deleted;
}
