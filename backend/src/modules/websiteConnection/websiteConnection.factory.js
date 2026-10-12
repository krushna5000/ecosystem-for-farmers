// Pure DB I/O for website_schema.connections. No business rules, no HTTP types.
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { connections } from "./websiteConnection.schema.js";

const exec = (tx) => tx ?? db;

export async function createConnectionInDB(values, tx) {
  const [row] = await exec(tx).insert(connections).values(values).returning();
  return row;
}

export function listConnectionsInDB(tx) {
  return exec(tx).select().from(connections).orderBy(desc(connections.connectionId));
}

export async function getConnectionByIdInDB(id, tx) {
  const [row] = await exec(tx).select().from(connections).where(eq(connections.connectionId, id));
  return row ?? null;
}

export async function updateConnectionInDB(id, changes, tx) {
  await exec(tx).update(connections).set(changes).where(eq(connections.connectionId, id));
}

/** Returns the deleted row, or null when there was none. */
export async function deleteConnectionInDB(id, tx) {
  const deleted = await exec(tx)
    .delete(connections)
    .where(eq(connections.connectionId, id))
    .returning({ id: connections.connectionId });
  return deleted[0] ?? null;
}

export function bulkDeleteConnectionsInDB(ids, tx) {
  return exec(tx)
    .delete(connections)
    .where(inArray(connections.connectionId, ids))
    .returning({ id: connections.connectionId });
}
