// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorSubCategoryService from "./vendorSubCategory.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createSubCategory(req, res) {
  const subCategory = await vendorSubCategoryService.createVendorSubCategory(req.vendor.id, req.body);
  sendSuccess(res, snakeKeys(subCategory), "Sub-category created successfully");
}

// The list keeps its old `{ success, data }` body (not the portal's usual "status" envelope).
export async function getAllSubCategories(req, res) {
  const { rows, pagination } = await vendorSubCategoryService.listVendorSubCategories(req.vendor.id, req.query);
  sendJson(res, { success: true, data: { subCategories: snakeRows(rows), pagination } });
}

export async function updateSubCategory(req, res) {
  const subCategory = await vendorSubCategoryService.updateVendorSubCategory(
    req.params.id,
    req.vendor.id,
    req.body,
  );
  sendSuccess(res, snakeKeys(subCategory), "Sub-category updated successfully");
}

export async function toggleSubCategoryStatus(req, res) {
  const updated = await vendorSubCategoryService.toggleVendorSubCategoryStatus(req.params.id);
  sendSuccess(res, updated, "Sub-category status updated successfully");
}

export async function deleteSubCategory(req, res) {
  const subCategory = await vendorSubCategoryService.deleteVendorSubCategory(req.params.id, req.vendor.id);
  sendSuccess(res, snakeKeys(subCategory), "Sub-category deleted successfully");
}

export async function deleteMultipleSubCategories(req, res) {
  const result = await vendorSubCategoryService.deleteVendorSubCategories(req.vendor.id, req.body.ids);
  sendSuccess(res, result, `${result.deletedCount} sub-category(s) deleted successfully`);
}
