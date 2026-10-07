import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";

// Express 5 leaves req.body undefined when no body was sent (Express 4 gave {}).
export const bodyOf = (req) => req.body || {};

// Old code relied on PostgreSQL parsing "true"/"false" strings coming from multipart forms.
const TRUE_VALUES = new Set(["true", "t", "yes", "y", "on", "1"]);
const FALSE_VALUES = new Set(["false", "f", "no", "n", "off", "0"]);
export const toBool = (value) => {
  if (typeof value === "boolean") return value;
  const v = String(value).trim().toLowerCase();
  if (TRUE_VALUES.has(v)) return true;
  if (FALSE_VALUES.has(v)) return false;
  throw new Error(`invalid input syntax for type boolean: "${value}"`);
};

// Select only the named columns of a table (keys keep their camelCase property names).
export const pickCols = (table, names) =>
  Object.fromEntries(names.map((n) => [n, table[n]]));

export const nowSql = sql`now()`;

// Row belonging to the company (id + company_id), or undefined.
export const findOwned = async (table, id, companyId) => {
  const [row] = await db
    .select()
    .from(table)
    .where(and(eq(table.id, id), eq(table.companyId, companyId)))
    .limit(1);
  return row;
};

export const removeOwned = async (table, id, companyId) => {
  const rows = await db
    .delete(table)
    .where(and(eq(table.id, id), eq(table.companyId, companyId)))
    .returning();
  return rows[0];
};

export const removeManyOwned = (table, ids, companyId) =>
  db
    .delete(table)
    .where(and(inArray(table.id, ids), eq(table.companyId, companyId)))
    .returning();

export const hasInvalidIds = (ids) => ids.filter((id) => isNaN(id)).length > 0;

export const countOwned = async (table, companyId) => {
  const [{ value }] = await db
    .select({ value: count() })
    .from(table)
    .where(eq(table.companyId, companyId));
  return value;
};
