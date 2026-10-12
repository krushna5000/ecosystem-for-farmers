// Small helpers shared by the admin portal modules (adminCompany, adminCompanyType, adminVendor, adminCompanyOtp, adminVendorOtp).
import { AppError } from "../errors/index.js";
import { errorMessage } from "../errors/dbError.js";

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

/** page/limit parsing identical to the old controllers (`hasPagination`: the client sent page and/or limit). */
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

/** Error options for the many admin failures whose legacy body is just `{ message }` (no `success` flag). */
export const messageOnly = (message) => ({ body: { message } });

/**
 * Legacy contract of the company / company-type endpoints: a failing database write answers
 * 500 `{ success: false, message: <driver message> }` (e.g. "duplicate key value violates unique constraint ...").
 * Deliberately thrown AppErrors pass through untouched.
 */
export const dbFailure = (err) => {
  if (err instanceof AppError) return err;
  const message = errorMessage(err) || "Internal Server Error";
  return new AppError(message, 500, { body: { success: false, message } });
};

/** `await guardDb(createXInDB(...))` — keeps the legacy 500-with-driver-message mapping at a write call site. */
export async function guardDb(promise) {
  try {
    return await promise;
  } catch (err) {
    throw dbFailure(err);
  }
}
