// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyLeadService from "./companyLead.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

// Legacy bodies are `{ success, data }` (no message): sent as they were.
export async function getAllLeads(req, res) {
  const rows = await companyLeadService.listCompanyLeads(req.company.id);
  sendJson(res, { success: true, data: snakeRows(rows) });
}

export async function updateLeadStatus(req, res) {
  const lead = await companyLeadService.updateCompanyLeadStatus(
    req.params.id,
    req.company.id,
    req.body.status,
  );
  // A lead of another company still answers 200, just without `data` (legacy behaviour).
  sendJson(res, { success: true, data: lead ? snakeKeys(lead) : undefined });
}
