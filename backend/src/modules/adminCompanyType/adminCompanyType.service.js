// Business rules for company types. Throws AppError subclasses; never touches req/res or db directly.
import {
  createCompanyTypeInDB,
  listCompanyTypesInDB,
  listCompanyTypesPageInDB,
  updateCompanyTypeInDB,
  deleteCompanyTypeInDB,
} from "./adminCompanyType.factory.js";
import { NotFoundError } from "../../errors/index.js";
import { guardDb } from "../../utils/adminHelpers.js";

// Writes keep the legacy contract: a driver failure (e.g. duplicate `type`) answers
// 500 { success:false, message: <driver message> }.

export function createCompanyType({ type, description }) {
  return guardDb(createCompanyTypeInDB({ type, description }));
}

/** `pagination` is null unless the client sent `page` and/or `limit`. */
export async function listCompanyTypes({ page, limit, offset, hasPagination }) {
  if (!hasPagination) {
    return { rows: await listCompanyTypesInDB(), pagination: null };
  }

  const { total, rows } = await listCompanyTypesPageInDB({ limit, offset });
  return { rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function updateCompanyType(id, { type, description }) {
  const row = await guardDb(updateCompanyTypeInDB(id, { type: type ?? null, description: description ?? null }));
  if (!row) throw new NotFoundError("Not found");
  return row;
}

export async function deleteCompanyType(id) {
  const row = await guardDb(deleteCompanyTypeInDB(id));
  if (!row) throw new NotFoundError("Not found");
  return row;
}
