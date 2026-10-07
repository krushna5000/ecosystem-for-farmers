import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";

export const now = () => sql`NOW()`;

/** Case-insensitive equality, same as the old `LOWER(col) = LOWER($1)` */
export const ciEq = (column, value) => sql`LOWER(${column}) = LOWER(${value})`;

/** Accepts booleans and the strings a multipart form / Postgres would accept. null/undefined pass through. */
export const toBoolean = (value) => {
  if (value === null || value === undefined || typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (["true", "t", "yes", "y", "on", "1"].includes(v)) return true;
  if (["false", "f", "no", "n", "off", "0"].includes(v)) return false;
  throw new Error(`invalid input syntax for type boolean: "${value}"`);
};

export const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  return { page, limit, offset: (page - 1) * limit };
};

export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

/** One page of a vendor-scoped table plus the total row count. */
export const pageByVendor = async (table, vendorId, orderBy, { limit, offset }) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(table)
    .where(eq(table.vendorId, vendorId));

  const rows = await db
    .select()
    .from(table)
    .where(eq(table.vendorId, vendorId))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return { total: Number(total), rows };
};

/** Normalises the `ids` of a bulk-delete body; returns null when the body is not an array / empty. */
export const parseIdList = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return null;
  return ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
};

/** DELETE ... WHERE vendor_id = $1 AND id = ANY($2) RETURNING * */
export const bulkDeleteByVendor = (table, vendorId, ids) =>
  db
    .delete(table)
    .where(and(eq(table.vendorId, vendorId), inArray(table.id, ids)))
    .returning();
