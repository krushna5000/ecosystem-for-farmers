// Business rules for vendor products. Throws AppError subclasses; never touches the HTTP request or response or db directly.
import {
  brandBelongsToVendorInDB,
  categoryBelongsToVendorInDB,
  subCategoryBelongsToVendorInDB,
  productNameExistsInDB,
  createVendorProductInDB,
  listVendorProductsInDB,
  listVendorProductsByBrandInDB,
  listVendorProductsByCategoryInDB,
  listVendorProductsBySubCategoryInDB,
  getVendorProductByIdInDB,
  vendorProductExistsInDB,
  updateVendorProductInDB,
  toggleVendorProductStatusInDB,
  deleteVendorProductInDB,
  bulkDeleteVendorProductsInDB,
} from "./vendorProduct.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";
import { paginationMeta, parseIdList } from "../../utils/vendorHelpers.js";

const IMAGE_FOLDER = "vendor-products";

// `body` has been through vendorProduct.validator.js: chemical_composition / crop_ids are already parsed.
export async function createVendorProduct(vendorId, body, file) {
  const { brand_id, category_id, sub_category_id, product_name, description, chemical_composition, crop_ids } =
    body;

  if (!(await brandBelongsToVendorInDB(brand_id, vendorId))) throw new BadRequestError("Invalid brand_id");
  if (!(await categoryBelongsToVendorInDB(category_id, vendorId))) {
    throw new BadRequestError("Invalid category_id");
  }
  if (!(await subCategoryBelongsToVendorInDB(sub_category_id, vendorId))) {
    throw new BadRequestError("Invalid sub_category_id");
  }

  const productName = product_name.trim();
  if (await productNameExistsInDB(vendorId, productName)) throw new BadRequestError("Product already exists");

  const image = file ? await uploadFile({ file, folder: IMAGE_FOLDER }) : null;

  return createVendorProductInDB({
    vendorId,
    brandId: brand_id,
    categoryId: category_id,
    subCategoryId: sub_category_id,
    productName,
    description: description || null,
    chemicalComposition: chemical_composition,
    cropIds: crop_ids,
    image,
  });
}

export async function listVendorProducts(vendorId, { page, limit }) {
  const { total, rows } = await listVendorProductsInDB(vendorId, { limit, offset: (page - 1) * limit });
  return { rows, pagination: paginationMeta(total, page, limit) };
}

export const listVendorProductsByBrand = (vendorId, brandId) => listVendorProductsByBrandInDB(vendorId, brandId);

export const listVendorProductsByCategory = (vendorId, categoryId) =>
  listVendorProductsByCategoryInDB(vendorId, categoryId);

export const listVendorProductsBySubCategory = (vendorId, subCategoryId) =>
  listVendorProductsBySubCategoryInDB(vendorId, subCategoryId);

export async function getVendorProductById(id, vendorId) {
  const row = await getVendorProductByIdInDB(id, vendorId);
  if (!row) throw new NotFoundError("Product not found");
  return row;
}

export async function updateVendorProduct(id, vendorId, body, file) {
  if (!(await vendorProductExistsInDB(id, vendorId))) throw new NotFoundError("Product not found");

  const { brand_id, category_id, sub_category_id, product_name, description, chemical_composition, crop_ids } =
    body;

  // Only provided fields change (COALESCE semantics of the old query)
  const changes = {};
  if (brand_id) changes.brandId = brand_id;
  if (category_id) changes.categoryId = category_id;
  if (sub_category_id) changes.subCategoryId = sub_category_id;
  if (product_name) changes.productName = product_name;
  if (description) changes.description = description;
  if (chemical_composition != null) changes.chemicalComposition = chemical_composition;
  if (crop_ids != null) changes.cropIds = crop_ids;
  if (file) changes.image = await uploadFile({ file, folder: IMAGE_FOLDER });

  return updateVendorProductInDB(id, vendorId, changes);
}

export async function toggleVendorProductStatus(id, vendorId) {
  const updated = await toggleVendorProductStatusInDB(id, vendorId);
  if (!updated) throw new NotFoundError("Product not found");
  return updated;
}

export async function deleteVendorProduct(id, vendorId) {
  const deleted = await deleteVendorProductInDB(id, vendorId);
  if (!deleted) throw new NotFoundError("Product not found");
  return deleted;
}

export async function deleteVendorProducts(vendorId, rawIds) {
  const ids = parseIdList(rawIds);
  if (ids.length === 0) throw new BadRequestError("No valid product IDs provided");

  const deleted = await bulkDeleteVendorProductsInDB(vendorId, ids);
  return { deletedCount: deleted.length, deletedIds: ids };
}
