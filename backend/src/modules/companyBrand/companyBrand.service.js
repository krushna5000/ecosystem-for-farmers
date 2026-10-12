// Business rules for company brands. Throws AppError subclasses; never touches req/res or db directly.
import {
  brandNameExistsInDB,
  createCompanyBrandInDB,
  listCompanyBrandOptionsInDB,
  countCompanyBrandsInDB,
  listCompanyBrandsInDB,
  getCompanyBrandByIdInDB,
  findOwnedCompanyBrandInDB,
  updateCompanyBrandInDB,
  deleteCompanyBrandInDB,
  deleteCompanyBrandsInDB,
} from "./companyBrand.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";
import { toBool } from "../../utils/companyHelpers.js";

const LOGO_FOLDER = "company/brands";

export async function createCompanyBrand(companyId, { brand_name }, file) {
  if (!file) throw new BadRequestError("Brand logo is required");

  if (await brandNameExistsInDB(companyId, brand_name)) {
    throw new BadRequestError("Brand already exists for this company");
  }

  const logo = await uploadFile({ file, folder: LOGO_FOLDER });
  return createCompanyBrandInDB({ companyId, brandName: brand_name, logo });
}

export function listCompanyBrandOptions(companyId) {
  return listCompanyBrandOptionsInDB(companyId);
}

export async function listCompanyBrands(companyId, { page, limit }) {
  const totalItems = await countCompanyBrandsInDB(companyId);
  const rows = await listCompanyBrandsInDB(companyId, { limit, offset: pageOffset(page, limit) });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}

export async function getCompanyBrandById(id, companyId) {
  const brand = await getCompanyBrandByIdInDB(id, companyId);
  if (!brand) throw new NotFoundError("Brand not found");
  return brand;
}

export async function updateCompanyBrand(id, companyId, { brand_name, status }, file) {
  if (!(await findOwnedCompanyBrandInDB(id, companyId))) throw new NotFoundError("Brand not found");

  // Only the provided fields change.
  const changes = {};
  if (brand_name != null) changes.brandName = brand_name;
  if (file) changes.logo = await uploadFile({ file, folder: LOGO_FOLDER });
  if (status != null) changes.status = toBool(status);

  return updateCompanyBrandInDB(id, companyId, changes);
}

export async function deleteCompanyBrand(id, companyId) {
  const deleted = await deleteCompanyBrandInDB(id, companyId);
  if (!deleted) throw new NotFoundError("Brand not found");
  return deleted;
}

export async function deleteCompanyBrands(companyId, ids) {
  const deleted = await deleteCompanyBrandsInDB(companyId, ids);
  if (deleted.length === 0) throw new NotFoundError("No brands found to delete");
  return deleted;
}
