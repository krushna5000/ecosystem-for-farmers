// Business rules for vendor brands. Throws AppError subclasses; never touches req/res or db directly.
import {
  brandNameExistsInDB,
  createVendorBrandInDB,
  listVendorBrandsInDB,
  getVendorBrandByIdInDB,
  updateVendorBrandInDB,
  deleteVendorBrandInDB,
  bulkDeleteVendorBrandsInDB,
} from "./vendorBrand.factory.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";
import { toBoolean, paginationMeta, parseIdList } from "../../utils/vendorHelpers.js";

const LOGO_FOLDER = "vendor-brands";

export async function createVendorBrand(vendorId, { brand_name, status }, file) {
  if (!file) throw new BadRequestError("Brand logo is required");

  if (await brandNameExistsInDB(vendorId, brand_name)) {
    throw new ConflictError("Brand already exists for this vendor");
  }

  const logo = await uploadFile({ file, folder: LOGO_FOLDER });
  return createVendorBrandInDB({ vendorId, brandName: brand_name, logo, status: toBoolean(status) });
}

export async function listVendorBrands(vendorId, { page, limit }) {
  const { total, rows } = await listVendorBrandsInDB(vendorId, { limit, offset: (page - 1) * limit });
  return { rows, pagination: paginationMeta(total, page, limit) };
}

export async function getVendorBrandById(id, vendorId) {
  const brand = await getVendorBrandByIdInDB(id, vendorId);
  if (!brand) throw new NotFoundError("Vendor brand not found");
  return brand;
}

export async function updateVendorBrand(id, vendorId, { brand_name, status }, file) {
  await getVendorBrandById(id, vendorId);

  const changes = {};
  if (brand_name != null) changes.brandName = brand_name;
  if (file) changes.logo = await uploadFile({ file, folder: LOGO_FOLDER });
  if (status != null) changes.status = toBoolean(status);

  return updateVendorBrandInDB(id, vendorId, changes);
}

export async function deleteVendorBrand(id, vendorId) {
  const deleted = await deleteVendorBrandInDB(id, vendorId);
  if (!deleted) throw new NotFoundError("Vendor brand not found");
  return deleted;
}

export async function deleteVendorBrands(vendorId, rawIds) {
  const ids = parseIdList(rawIds);
  if (ids.length === 0) throw new BadRequestError("No valid brand IDs provided");

  const deleted = await bulkDeleteVendorBrandsInDB(vendorId, ids);
  return { deletedCount: deleted.length, deletedIds: ids };
}
