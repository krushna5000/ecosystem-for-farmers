// Drizzle tables used by the super admin "admin" module — re-exported from the canonical db/schema
// (shared tables are fine to re-export from several modules).
// `vendors` and `companies` are only read: an admin e-mail must be unique across every portal.
export { superAdmins, admins, vendors, companies } from "../../db/schema/index.js";
