// Small shared helpers for the admin module.

/** Drizzle wraps driver errors; the original pg message lives in `cause`. */
export const dbErrorMessage = (err) => err?.cause?.message || err?.message || "Internal Server Error";

/** "" -> null (the old code normalised blank form fields before COALESCE). */
export const blankToNull = (v) => (v === "" ? null : v);

/**
 * Emulates `COALESCE($n, column)`: drops null/undefined entries so the column keeps its value.
 * `updated_at` is always refreshed, like `updated_at = CURRENT_TIMESTAMP`.
 */
export const coalescePatch = (values) => {
  const patch = {};
  for (const [k, v] of Object.entries(values)) {
    if (v !== null && v !== undefined) patch[k] = v;
  }
  patch.updatedAt = new Date();
  return patch;
};

/** page/limit parsing identical to the old controllers. */
export const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  return {
    page,
    limit,
    offset: (page - 1) * limit,
    hasPagination: Boolean(query.page || query.limit),
  };
};

export const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
