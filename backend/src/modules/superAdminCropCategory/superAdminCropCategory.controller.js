// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not handled here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as superAdminCropCategoryService from "./superAdminCropCategory.service.js";
import { sendCreated, sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCategory(req, res) {
  const category = await superAdminCropCategoryService.createCategory(req.body);
  sendCreated(res, snakeKeys(category), "Category created successfully");
}

export async function getAllCategories(req, res) {
  const { rows, pagination } = await superAdminCropCategoryService.listCategories(req.query);
  sendJson(res, {
    success: true,
    message: "Categories retrieved successfully",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCategoryById(req, res) {
  const category = await superAdminCropCategoryService.getCategoryById(req.params.id);
  sendSuccess(res, snakeKeys(category), "Category retrieved successfully");
}

export async function updateCategory(req, res) {
  const category = await superAdminCropCategoryService.updateCategory(req.params.id, req.body);
  sendSuccess(res, snakeKeys(category), "Category updated successfully");
}

export async function deleteCategory(req, res) {
  const category = await superAdminCropCategoryService.deleteCategory(req.params.id);
  sendSuccess(res, snakeKeys(category), "Category deleted successfully");
}

export async function bulkDeleteCategories(req, res) {
  const { deletedCount, deletedIds } = await superAdminCropCategoryService.bulkDeleteCategories(req.body.ids);
  sendJson(res, { success: true, message: "Categories deleted successfully", deletedCount, deletedIds });
}
