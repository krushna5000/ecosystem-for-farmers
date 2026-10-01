/**
 * Drizzle returns camelCase property names (e.g. `phoneNumber`), while the
 * previous raw-SQL backends returned snake_case column names (`phone_number`)
 * and the existing frontends read those. These helpers convert ONLY the
 * top-level keys of a row, so JSON/JSONB column contents (farm_coordinates,
 * chemical_composition, current_stage ...) are never touched.
 */

export const camelToSnake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** { phoneNumber: 1 } -> { phone_number: 1 }  (null/undefined/arrays-of-primitives pass through) */
export function snakeKeys(row) {
  if (row === null || row === undefined || typeof row !== "object") return row;
  if (Array.isArray(row)) return row;
  if (row instanceof Date) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[camelToSnake(k)] = v;
  return out;
}

/** Map snakeKeys over an array of rows. */
export const snakeRows = (rows) => (Array.isArray(rows) ? rows.map(snakeKeys) : rows);
