// Business rules for contact-form connections. Throws AppError subclasses; never touches req/res or db directly.
import {
  createConnectionInDB,
  listConnectionsInDB,
  getConnectionByIdInDB,
  updateConnectionInDB,
  deleteConnectionInDB,
  bulkDeleteConnectionsInDB,
} from "./websiteConnection.factory.js";
import { NotFoundError } from "../../errors/index.js";
import { withLegacy500 } from "../../utils/websiteHelpers.js";

// Single-connection 404s answer `{ message }`, not the router's `{ success, message }` envelope.
const connectionNotFound = () =>
  new NotFoundError("Connection not found", { body: { message: "Connection not found" } });

export function createConnection({ name, email, mobile, query }) {
  return withLegacy500("Error creating connection:", () =>
    createConnectionInDB({ name, email, mobile, query }),
  );
}

export function listConnections() {
  return withLegacy500("Error fetching connections:", () => listConnectionsInDB());
}

export function getConnectionById(id) {
  return withLegacy500("Error fetching connection:", async () => {
    const row = await getConnectionByIdInDB(id);
    if (!row) throw connectionNotFound();
    return row;
  });
}

/** Partial update: omitted fields keep their stored value. Returns the merged field set. */
export function updateConnection(id, { name, email, mobile, query, status }) {
  return withLegacy500("Error updating connection:", async () => {
    const existing = await getConnectionByIdInDB(id);
    if (!existing) throw connectionNotFound();

    const updated = {
      name: name ?? existing.name,
      email: email ?? existing.email,
      mobile: mobile ?? existing.mobile,
      query: query ?? existing.query,
      status: status ?? existing.status,
    };

    await updateConnectionInDB(id, updated);
    return updated;
  });
}

export function deleteConnection(id) {
  return withLegacy500("Error deleting connection:", async () => {
    if (!(await deleteConnectionInDB(id))) throw connectionNotFound();
  });
}

export async function deleteConnections(ids) {
  const deleted = await bulkDeleteConnectionsInDB(ids);
  if (deleted.length === 0) throw new NotFoundError("No connections found for given IDs");
  return { deletedCount: deleted.length };
}
