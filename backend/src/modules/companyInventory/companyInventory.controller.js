// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyInventoryService from "./companyInventory.service.js";
import { sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCompanyInventory(req, res) {
  const inventory = await companyInventoryService.createCompanyInventory(req.company.id, req.body);
  sendSuccess(res, snakeKeys(inventory), "Inventory created successfully");
}

export async function updateCompanyInventory(req, res) {
  const inventory = await companyInventoryService.updateCompanyInventory(
    req.params.id,
    req.company.id,
    req.body,
  );
  sendSuccess(res, snakeKeys(inventory), "Inventory updated successfully");
}

// The one endpoint of this router that has always answered `{ status: "success", ... }`.
export async function getCompanyInventoryList(req, res) {
  const { rows, pagination } = await companyInventoryService.listCompanyInventory(
    req.company.id,
    req.query,
  );
  sendJson(res, {
    status: "success",
    message: "Inventory list fetched",
    data: snakeRows(rows),
    pagination,
  });
}

export async function getCompanyInventoryById(req, res) {
  const row = await companyInventoryService.getCompanyInventoryById(req.params.id, req.company.id);
  sendSuccess(res, snakeKeys(row), "Inventory details fetched");
}

export async function deleteCompanyInventory(req, res) {
  await companyInventoryService.deleteCompanyInventory(req.params.id, req.company.id);
  sendSuccess(res, null, "Inventory deleted successfully");
}

export async function deleteCompanyInventories(req, res) {
  const deleted = await companyInventoryService.deleteCompanyInventories(req.company.id, req.body.ids);
  sendSuccess(res, snakeRows(deleted), `${deleted.length} inventory item(s) deleted successfully`);
}
