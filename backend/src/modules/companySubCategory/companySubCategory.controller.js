// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companySubCategoryService from "./companySubCategory.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCompanySubCategory(req, res) {
  const subCategory = await companySubCategoryService.createCompanySubCategory(
    req.company.id,
    req.body,
  );
  sendSuccess(res, snakeKeys(subCategory), "Sub-category created successfully");
}

export async function getAllCompanySubCategories(req, res) {
  const rows = await companySubCategoryService.listCompanySubCategoryOptions(req.company.id);
  sendSuccess(res, snakeRows(rows), "Sub-categories fetched successfully");
}

// `{ status, message, data, pagination }`: the extra key is why this one is sent as-is.
export async function getCompanySubCategoriesTable(req, res) {
  const { rows, pagination } = await companySubCategoryService.listCompanySubCategories(
    req.company.id,
    req.query,
  );
  sendJson(res, {
    status: "success",
    message: "Sub-categories fetched successfully",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCompanySubCategoryById(req, res) {
  const subCategory = await companySubCategoryService.getCompanySubCategoryById(
    req.params.id,
    req.company.id,
  );
  sendSuccess(res, snakeKeys(subCategory), "Sub-category fetched successfully");
}

export async function updateCompanySubCategory(req, res) {
  const subCategory = await companySubCategoryService.updateCompanySubCategory(
    req.params.id,
    req.company.id,
    req.body,
  );
  sendSuccess(res, snakeKeys(subCategory), "Sub-category updated successfully");
}

export async function toggleCompanySubCategoryStatus(req, res) {
  const updated = await companySubCategoryService.toggleCompanySubCategoryStatus(
    req.params.id,
    req.company.id,
  );
  sendSuccess(res, snakeKeys(updated), "Sub-category status updated successfully");
}

export async function deleteCompanySubCategory(req, res) {
  const subCategory = await companySubCategoryService.deleteCompanySubCategory(
    req.params.id,
    req.company.id,
  );
  sendSuccess(res, snakeKeys(subCategory), "Sub-category deleted successfully");
}

export async function deleteCompanySubCategories(req, res) {
  const deleted = await companySubCategoryService.deleteCompanySubCategories(
    req.company.id,
    req.body.ids,
  );
  sendSuccess(res, snakeRows(deleted), `${deleted.length} sub-category(ies) deleted successfully`);
}
