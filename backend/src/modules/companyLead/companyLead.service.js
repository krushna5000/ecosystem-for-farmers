// Business rules for company leads. Never touches req/res or db directly.
import { listLeadsInDB, updateLeadStatusInDB } from "./companyLead.factory.js";

export function listCompanyLeads(companyId) {
  return listLeadsInDB(companyId);
}

/** Resolves to the updated lead, or null when the lead does not belong to the company. */
export function updateCompanyLeadStatus(id, companyId, status) {
  return updateLeadStatusInDB(id, companyId, status);
}
