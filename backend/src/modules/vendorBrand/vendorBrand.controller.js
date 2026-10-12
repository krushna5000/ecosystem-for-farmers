// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorBrandService from "./vendorBrand.service.js";
import { sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createVendorBrand(req, res) {
  const brand = await vendorBrandService.createVendorBrand(req.vendor.id, req.body, req.file);
  sendSuccess(res, snakeKeys(brand), "Vendor brand created successfully");
}

export async function getAllVendorBrands(req, res) {
  const { rows, pagination } = await vendorBrandService.listVendorBrands(req.vendor.id, req.query);
  sendSuccess(res, { data: snakeRows(rows), pagination }, "Vendor brands fetched successfully");
}

export async function getVendorBrandById(req, res) {
  const brand = await vendorBrandService.getVendorBrandById(req.params.id, req.vendor.id);
  sendSuccess(res, snakeKeys(brand), "Vendor brand fetched successfully");
}

export async function updateVendorBrand(req, res) {
  const brand = await vendorBrandService.updateVendorBrand(req.params.id, req.vendor.id, req.body, req.file);
  sendSuccess(res, snakeKeys(brand), "Vendor brand updated successfully");
}

export async function deleteVendorBrand(req, res) {
  const brand = await vendorBrandService.deleteVendorBrand(req.params.id, req.vendor.id);
  sendSuccess(res, snakeKeys(brand), "Vendor brand deleted successfully");
}

export async function deleteMultipleBrands(req, res) {
  const result = await vendorBrandService.deleteVendorBrands(req.vendor.id, req.body.ids);
  sendSuccess(res, result, `${result.deletedCount} brand(s) deleted successfully`);
}
