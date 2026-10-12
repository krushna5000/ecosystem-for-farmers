// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyCategoryService from "./companyCategory.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

// `{ success, message, category }`, `{ success, category }` and `{ success, message }` are legacy
// contracts that `sendSuccess` cannot produce, so they go through sendJson.
export async function createCompanyCategory(req, res) {
  const category = await companyCategoryService.createCompanyCategory(req.company.id, req.body);
  sendJson(
    res,
    { success: true, message: "Category created successfully", category: snakeKeys(category) },
    201,
  );
}

export async function getAllCompanyCategories(req, res) {
  const rows = await companyCategoryService.listCompanyCategoryOptions(req.company.id);
  sendSuccess(res, snakeRows(rows), "Categories fetched successfully");
}

export async function getCompanyCategoriesTable(req, res) {
  const { rows, pagination } = await companyCategoryService.listCompanyCategories(
    req.company.id,
    req.query,
  );
  sendJson(res, {
    success: true,
    message: "Categories fetched successfully",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCompanyCategoryById(req, res) {
  const category = await companyCategoryService.getCompanyCategoryById(req.params.id, req.company.id);
  sendJson(res, { success: true, category: snakeKeys(category) });
}

export async function updateCompanyCategory(req, res) {
  const category = await companyCategoryService.updateCompanyCategory(
    req.params.id,
    req.company.id,
    req.body,
  );
  sendSuccess(res, snakeKeys(category), "Category updated successfully");
}

export async function toggleCompanyCategoryStatus(req, res) {
  await companyCategoryService.toggleCompanyCategoryStatus(req.params.id, req.company.id);
  sendJson(res, { success: true, message: "Category status updated successfully" });
}

export async function deleteCompanyCategory(req, res) {
  const category = await companyCategoryService.deleteCompanyCategory(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(category), "Category deleted successfully");
}

export async function deleteCompanyCategories(req, res) {
  const deleted = await companyCategoryService.deleteCompanyCategories(req.company.id, req.body.ids);
  sendSuccess(res, snakeRows(deleted), `${deleted.length} category(ies) deleted successfully`);
}
