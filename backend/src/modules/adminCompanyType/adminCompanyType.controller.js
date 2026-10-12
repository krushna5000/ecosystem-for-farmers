// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as adminCompanyTypeService from "./adminCompanyType.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createCompanyType(req, res) {
  const row = await adminCompanyTypeService.createCompanyType(req.body);
  sendJson(res, { success: true, data: snakeKeys(row) }, 201);
}

export async function getCompanyTypes(req, res) {
  const { rows, pagination } = await adminCompanyTypeService.listCompanyTypes(req.query);
  sendJson(res, { success: true, data: snakeRows(rows), ...pagination });
}

export async function updateCompanyType(req, res) {
  const row = await adminCompanyTypeService.updateCompanyType(req.params.id, req.body);
  sendJson(res, { success: true, data: snakeKeys(row) });
}

export async function deleteCompanyType(req, res) {
  await adminCompanyTypeService.deleteCompanyType(req.params.id);
  sendJson(res, { success: true, message: "Company type deleted successfully" });
}
