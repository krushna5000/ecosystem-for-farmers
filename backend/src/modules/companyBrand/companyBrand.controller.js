// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyBrandService from "./companyBrand.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCompanyBrand(req, res) {
  const brand = await companyBrandService.createCompanyBrand(req.company.id, req.body, req.file);
  sendSuccess(res, snakeKeys(brand), "Brand created successfully");
}

// The two list endpoints have always answered without a `message`: bodies are sent as they were.
export async function getAllCompanyBrands(req, res) {
  const rows = await companyBrandService.listCompanyBrandOptions(req.company.id);
  sendJson(res, { status: "success", data: snakeRows(rows) });
}

export async function getCompanyBrandsTable(req, res) {
  const { rows, pagination } = await companyBrandService.listCompanyBrands(req.company.id, req.query);
  sendJson(res, { status: "success", data: snakeRows(rows), pagination });
}

export async function getCompanyBrandById(req, res) {
  const brand = await companyBrandService.getCompanyBrandById(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(brand), "Brand fetched successfully");
}

export async function updateCompanyBrand(req, res) {
  const brand = await companyBrandService.updateCompanyBrand(
    req.params.id,
    req.company.id,
    req.body,
    req.file,
  );
  sendSuccess(res, snakeKeys(brand), "Brand updated successfully");
}

export async function deleteCompanyBrand(req, res) {
  const brand = await companyBrandService.deleteCompanyBrand(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(brand), "Brand deleted successfully");
}

export async function deleteCompanyBrands(req, res) {
  const deleted = await companyBrandService.deleteCompanyBrands(req.company.id, req.body.ids);
  sendSuccess(res, snakeRows(deleted), `${deleted.length} brand(s) deleted successfully`);
}
