// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as adminVendorService from "./adminVendor.service.js";
import { sendCreated, sendJson, sendSuccess } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function addVendorWithDocs(req, res) {
  const vendor = await adminVendorService.addVendorWithDocs(req.body, req.files);
  sendCreated(res, snakeKeys(vendor), "Vendor registered successfully. Verification email sent.");
}

export async function updateVendorWithDocs(req, res) {
  const row = await adminVendorService.updateVendorWithDocs(req.params.id, req.body, req.files);
  sendSuccess(res, snakeKeys(row), "Vendor updated successfully");
}

export async function getAllVendorsWithDocs(req, res) {
  const { rows, pagination } = await adminVendorService.listVendors(req.query);
  sendJson(
    res,
    pagination
      ? { success: true, data: snakeRows(rows), ...pagination }
      : { success: true, count: rows.length, data: snakeRows(rows) },
  );
}

export async function deleteVendorWithDocs(req, res) {
  const deleted = await adminVendorService.deleteVendorWithDocs(req.params.id);
  sendSuccess(res, deleted, "Vendor deleted permanently");
}

export async function toggleVendorActive(req, res) {
  const updated = await adminVendorService.toggleVendorActive(req.params.id);
  sendSuccess(res, updated, `Vendor is now ${updated.is_active ? "ACTIVE" : "INACTIVE"}`);
}

export async function verifyVendorEmail(req, res) {
  const { message, token } = await adminVendorService.verifyVendorEmail(req.params.token);
  sendJson(res, { success: true, message, token });
}

export async function resetVendorPassword(req, res) {
  await adminVendorService.resetVendorPassword(req.params.token, req.body.newPassword);
  sendJson(res, { success: true, message: "Vendor password reset successfully" });
}

export async function bulkDeleteVendors(req, res) {
  const deleted = await adminVendorService.bulkDeleteVendors(req.body.ids);
  sendJson(res, {
    success: true,
    message: `${deleted.length} vendor(s) deleted permanently`,
    deletedCount: deleted.length,
    deletedVendors: deleted,
  });
}
