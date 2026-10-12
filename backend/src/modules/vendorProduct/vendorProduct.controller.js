// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorProductService from "./vendorProduct.service.js";
import { sendSuccess } from "../../utils/response.js";
import { snakeKeys } from "../../utils/rowCase.js";

// { product, brand_name, category_name, sub_category_name }  ->  one flat snake_case object
const flattenProduct = ({ product, ...names }) => ({ ...snakeKeys(product), ...names });

export async function createProduct(req, res) {
  const product = await vendorProductService.createVendorProduct(req.vendor.id, req.body, req.file);
  sendSuccess(res, snakeKeys(product), "Product created successfully");
}

export async function getAllProducts(req, res) {
  const { rows, pagination } = await vendorProductService.listVendorProducts(req.vendor.id, req.query);
  sendSuccess(res, { data: rows.map(flattenProduct), pagination }, "Products fetched successfully");
}

export async function getProductsByBrand(req, res) {
  const rows = await vendorProductService.listVendorProductsByBrand(req.vendor.id, req.params.brand_id);
  sendSuccess(res, rows.map(flattenProduct), "Products fetched successfully");
}

export async function getProductsByCategory(req, res) {
  const rows = await vendorProductService.listVendorProductsByCategory(req.vendor.id, req.params.category_id);
  sendSuccess(res, rows.map(flattenProduct), "Products fetched successfully");
}

export async function getProductsBySubCategory(req, res) {
  const rows = await vendorProductService.listVendorProductsBySubCategory(
    req.vendor.id,
    req.params.sub_category_id,
  );
  sendSuccess(res, rows.map(flattenProduct), "Products fetched successfully");
}

export async function getProductById(req, res) {
  const row = await vendorProductService.getVendorProductById(req.params.id, req.vendor.id);
  sendSuccess(res, flattenProduct(row), "Product fetched successfully");
}

export async function updateProduct(req, res) {
  const product = await vendorProductService.updateVendorProduct(req.params.id, req.vendor.id, req.body, req.file);
  sendSuccess(res, snakeKeys(product), "Product updated successfully");
}

export async function toggleProductStatus(req, res) {
  const updated = await vendorProductService.toggleVendorProductStatus(req.params.id, req.vendor.id);
  sendSuccess(res, updated, "Product status updated successfully");
}

export async function deleteProduct(req, res) {
  const product = await vendorProductService.deleteVendorProduct(req.params.id, req.vendor.id);
  sendSuccess(res, snakeKeys(product), "Product deleted successfully");
}

export async function deleteMultipleProducts(req, res) {
  const result = await vendorProductService.deleteVendorProducts(req.vendor.id, req.body.ids);
  sendSuccess(res, result, `${result.deletedCount} product(s) deleted successfully`);
}
