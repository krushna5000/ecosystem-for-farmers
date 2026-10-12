// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorCategoryService from "./vendorCategory.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

// Most category bodies are bespoke (`{ success, message, category }`, `{ success, data }` ...) and go
// through sendJson; update / delete / bulk-delete use the standard `{ success, message, data }` envelope.

export async function createCategory(req, res) {
  const category = await vendorCategoryService.createVendorCategory(req.vendor.id, req.body);
  sendJson(
    res,
    { success: true, message: "Category created successfully", category: snakeKeys(category) },
    201,
  );
}

export async function getAllCategories(req, res) {
  const { rows, pagination } = await vendorCategoryService.listVendorCategories(req.vendor.id, req.query);
  sendJson(res, { success: true, data: { categories: snakeRows(rows), pagination } });
}

export async function getCategoryById(req, res) {
  const category = await vendorCategoryService.getVendorCategoryById(req.params.id, req.vendor.id);
  sendJson(res, { success: true, category: snakeKeys(category) });
}

export async function updateCategory(req, res) {
  const category = await vendorCategoryService.updateVendorCategory(req.params.id, req.vendor.id, req.body);
  sendSuccess(res, snakeKeys(category), "Category updated successfully");
}

export async function toggleCategoryStatus(req, res) {
  await vendorCategoryService.toggleVendorCategoryStatus(req.params.id, req.vendor.id);
  sendJson(res, { success: true, message: "Category status updated successfully" });
}

export async function deleteCategory(req, res) {
  const category = await vendorCategoryService.deleteVendorCategory(req.params.id, req.vendor.id);
  sendSuccess(res, snakeKeys(category), "Category deleted successfully");
}

export async function deleteMultipleCategories(req, res) {
  const result = await vendorCategoryService.deleteVendorCategories(req.vendor.id, req.body.ids);
  sendSuccess(res, result, `${result.deletedCount} category(s) deleted successfully`);
}
