// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyProductService from "./companyProduct.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCompanyProduct(req, res) {
  const product = await companyProductService.createCompanyProduct(req.company.id, req.body, req.file);
  sendSuccess(res, snakeKeys(product), "Product created successfully");
}

export async function getAllCompanyProducts(req, res) {
  const rows = await companyProductService.listCompanyProductOptions(req.company.id);
  sendSuccess(res, snakeRows(rows), "Products fetched successfully");
}

// `{ status, message, data, pagination }`: the extra key is why this one is sent as-is.
export async function getCompanyProductsTable(req, res) {
  const { rows, pagination } = await companyProductService.listCompanyProducts(
    req.company.id,
    req.query,
  );
  sendJson(res, {
    status: "success",
    message: "Products fetched successfully",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCompanyProductById(req, res) {
  const product = await companyProductService.getCompanyProductById(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(product), "Product fetched successfully");
}

export async function updateCompanyProduct(req, res) {
  const product = await companyProductService.updateCompanyProduct(
    req.params.id,
    req.company.id,
    req.body,
    req.file,
  );
  sendSuccess(res, snakeKeys(product), "Product updated successfully");
}

export async function toggleCompanyProductStatus(req, res) {
  const updated = await companyProductService.toggleCompanyProductStatus(
    req.params.id,
    req.company.id,
  );
  sendSuccess(res, snakeKeys(updated), "Product status updated successfully");
}

export async function deleteCompanyProduct(req, res) {
  const product = await companyProductService.deleteCompanyProduct(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(product), "Product deleted successfully");
}

export async function deleteCompanyProducts(req, res) {
  const deleted = await companyProductService.deleteCompanyProducts(req.company.id, req.body.ids);
  sendSuccess(res, snakeRows(deleted), `${deleted.length} product(s) deleted successfully`);
}

// Public: recommended products for a crop / disease / chemical composition.
export async function recommendationApi(req, res) {
  const { cropIdResolved, breakdown, data } =
    await companyProductService.getCompanyProductRecommendations(req.query);

  sendJson(res, {
    status: "success",
    message: `Found ${data.length} product(s)`,
    count: data.length,
    cropIdResolved,
    breakdown,
    data,
  });
}
