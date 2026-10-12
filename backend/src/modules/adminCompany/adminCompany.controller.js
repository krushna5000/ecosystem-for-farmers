// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as adminCompanyService from "./adminCompany.service.js";
import { sendCreated, sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function addCompany(req, res) {
  const { company, emailSent } = await adminCompanyService.addCompany(req.body, req.file);
  sendCreated(
    res,
    company,
    emailSent
      ? "Company registered. Verification email sent."
      : "Company registered, but verification email could not be sent.",
  );
}

export async function getAllCompanies(req, res) {
  const { rows, pagination } = await adminCompanyService.listCompanies(req.query);
  sendJson(res, { success: true, data: snakeRows(rows), ...pagination });
}

export async function getCompanyById(req, res) {
  const row = await adminCompanyService.getCompanyById(req.params.id);
  sendJson(res, { success: true, data: snakeKeys(row) });
}

export async function updateCompany(req, res) {
  const row = await adminCompanyService.updateCompany(req.params.id, req.body, req.file);
  sendJson(res, { success: true, data: snakeKeys(row) });
}

export async function deleteCompany(req, res) {
  const deleted = await adminCompanyService.deleteCompany(req.params.id);
  sendJson(res, { success: true, message: "Company deleted permanently", deleted_company: deleted });
}

export async function toggleCompanyActive(req, res) {
  const updated = await adminCompanyService.toggleCompanyActive(req.params.id);
  sendSuccess(res, updated, `Company is now ${updated.is_active ? "ACTIVE" : "INACTIVE"}`);
}

export async function resetCompanyPassword(req, res) {
  await adminCompanyService.resetCompanyPassword(req.params.token, req.body.newPassword);
  sendJson(res, { success: true, message: "Password reset successfully" });
}

export async function verifyCompanyEmail(req, res) {
  const { message, token } = await adminCompanyService.verifyCompanyEmail(req.params.token);
  sendJson(res, { success: true, message, token });
}

export async function bulkDeleteCompanies(req, res) {
  const deleted = await adminCompanyService.bulkDeleteCompanies(req.body.ids);
  sendJson(res, {
    success: true,
    message: `${deleted.length} company(ies) deleted permanently`,
    deletedCount: deleted.length,
    deletedCompanies: deleted,
  });
}
