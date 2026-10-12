// Business rules for crop categories. Throws AppError subclasses; never touches the HTTP request/response or db.
import {
  createCategoryInDB,
  listCategoriesInDB,
  getCategoryByIdInDB,
  updateCategoryInDB,
  deleteCategoryInDB,
  bulkDeleteCategoriesInDB,
} from "./superAdminCropCategory.factory.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";
import { isUniqueViolation } from "../../errors/dbError.js";
import { buildPagination } from "../../utils/superAdminPagination.js";

const NAME_TAKEN = "Category name already exists";

export async function createCategory({ category_name, description }) {
  try {
    return await createCategoryInDB({ categoryName: category_name, description: description ?? null });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ConflictError(NAME_TAKEN);
    throw err;
  }
}

export async function listCategories({ page, limit }) {
  const { rows, total } = await listCategoriesInDB({ limit, offset: (page - 1) * limit });
  return { rows, pagination: buildPagination(page, limit, total) };
}

export async function getCategoryById(id) {
  const category = await getCategoryByIdInDB(id);
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function updateCategory(id, { category_name, description }) {
  let category;
  try {
    category = await updateCategoryInDB(id, { categoryName: category_name, description: description ?? null });
  } catch (err) {
    if (isUniqueViolation(err)) throw new ConflictError(NAME_TAKEN);
    throw err;
  }
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function deleteCategory(id) {
  const category = await deleteCategoryInDB(id);
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function bulkDeleteCategories(ids) {
  const deletedIds = await bulkDeleteCategoriesInDB(ids);
  if (deletedIds.length === 0) throw new NotFoundError("No categories found with provided IDs");
  return { deletedCount: deletedIds.length, deletedIds };
}
