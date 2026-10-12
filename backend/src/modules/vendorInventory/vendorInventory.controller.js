// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as vendorInventoryService from "./vendorInventory.service.js";
import { sendSuccess } from "../../utils/response.js";
import { snakeKeys } from "../../utils/rowCase.js";

export async function createInventory(req, res) {
  const inventory = await vendorInventoryService.createVendorInventory(req.vendor.id, req.body);
  sendSuccess(res, snakeKeys(inventory), "Inventory created successfully");
}

export async function updateInventory(req, res) {
  const inventory = await vendorInventoryService.updateVendorInventory(req.params.id, req.vendor.id, req.body);
  sendSuccess(res, snakeKeys(inventory), "Inventory updated successfully");
}

export async function getInventoryList(req, res) {
  const rows = await vendorInventoryService.listVendorInventory(req.vendor.id);

  const formatted = rows.map(({ inv, product_name }) => ({
    id: inv.id,
    product_name,
    quantity: inv.quantity,
    stock_status: inv.stockStatus,
    vendor_id: inv.vendorId,
    product_id: inv.productId,
    created_at: inv.createdAt,
    updated_at: inv.updatedAt,
  }));

  sendSuccess(res, formatted, "Inventory list fetched");
}

export async function getInventoryById(req, res) {
  const { inv, product_name } = await vendorInventoryService.getVendorInventoryById(
    req.params.id,
    req.vendor.id,
  );
  sendSuccess(res, { ...snakeKeys(inv), product_name }, "Inventory details fetched");
}

export async function deleteInventory(req, res) {
  await vendorInventoryService.deleteVendorInventory(req.params.id, req.vendor.id);
  sendSuccess(res, null, "Inventory deleted successfully");
}
