// Business rules for company products. Throws AppError subclasses; never touches req/res or db directly.
import {
  findOwnedBrandInDB,
  findOwnedCategoryInDB,
  findOwnedSubCategoryInDB,
  findOwnedCompanyProductInDB,
  productNameExistsInDB,
  createCompanyProductInDB,
  listCompanyProductOptionsInDB,
  countCompanyProductsInDB,
  listCompanyProductsInDB,
  getCompanyProductByIdInDB,
  updateCompanyProductInDB,
  toggleCompanyProductStatusInDB,
  deleteCompanyProductInDB,
  deleteCompanyProductsInDB,
} from "./companyProduct.factory.js";
import { parseMaybeJson, parseCropIds, parseDiseaseNames } from "./companyProduct.parse.js";
import { findRecommendations } from "../companyRecommendation/companyRecommendation.service.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";
import { getPaginationMeta, pageOffset } from "../../utils/companyPagination.js";

const IMAGE_FOLDER = "company/products";

const REQUIRED_FIELDS =
  "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required";

export async function createCompanyProduct(companyId, body, file) {
  const { brand_id, category_id, sub_category_id, product_name, description } = body;

  /* ---------- SAFE JSON PARSING ---------- */
  let chemical_composition = [];
  let crop_ids = [];
  let disease_names = [];

  try {
    if (body.chemical_composition) {
      chemical_composition = parseMaybeJson(body.chemical_composition);
    }
    if (body.crop_ids) crop_ids = parseCropIds(body.crop_ids);
    if (body.disease_names) disease_names = parseDiseaseNames(body.disease_names);
  } catch {
    throw new BadRequestError("Invalid JSON format");
  }

  /* ---------- Validation ---------- */
  if (
    !brand_id ||
    !category_id ||
    !sub_category_id ||
    !product_name ||
    !chemical_composition.length ||
    !crop_ids.length
  ) {
    throw new BadRequestError(REQUIRED_FIELDS);
  }

  /* ---------- Validate Brand / Category / Sub-Category ---------- */
  if (!(await findOwnedBrandInDB(brand_id, companyId))) throw new BadRequestError("Invalid brand_id");

  if (!(await findOwnedCategoryInDB(category_id, companyId))) {
    throw new BadRequestError("Invalid category_id");
  }

  if (!(await findOwnedSubCategoryInDB(sub_category_id, companyId))) {
    throw new BadRequestError("Invalid sub_category_id");
  }

  /* ---------- Duplicate Product Check ---------- */
  if (await productNameExistsInDB(companyId, product_name.trim())) {
    throw new BadRequestError("Product already exists");
  }

  /* ---------- Upload Image (Optional) ---------- */
  const image = file ? await uploadFile({ file, folder: IMAGE_FOLDER }) : null;

  return createCompanyProductInDB({
    companyId,
    brandId: brand_id,
    categoryId: category_id,
    subCategoryId: sub_category_id,
    productName: product_name.trim(),
    description: description || null,
    chemicalComposition: chemical_composition,
    cropIds: crop_ids,
    diseaseNames: disease_names,
    image,
  });
}

export function listCompanyProductOptions(companyId) {
  return listCompanyProductOptionsInDB(companyId);
}

export async function listCompanyProducts(companyId, { page, limit }) {
  const totalItems = await countCompanyProductsInDB(companyId);
  const rows = await listCompanyProductsInDB(companyId, { limit, offset: pageOffset(page, limit) });
  return { rows, pagination: getPaginationMeta({ page, limit, totalItems }) };
}

export async function getCompanyProductById(id, companyId) {
  const product = await getCompanyProductByIdInDB(id, companyId);
  if (!product) throw new NotFoundError("Product not found");
  return product;
}

export async function updateCompanyProduct(id, companyId, body, file) {
  const { brand_id, category_id, sub_category_id, product_name, description } = body;

  /* ---------- SAFE JSON PARSING ---------- */
  let chemical_composition = null;
  let crop_ids = null;
  let disease_names = null;

  if (body.chemical_composition) {
    try {
      chemical_composition = parseMaybeJson(body.chemical_composition);
    } catch {
      throw new BadRequestError("chemical_composition must be valid JSON");
    }
  }

  if (body.crop_ids) {
    try {
      crop_ids = parseCropIds(body.crop_ids);
    } catch {
      throw new BadRequestError("crop_ids must be valid JSON");
    }
  }

  if (body.disease_names) {
    try {
      disease_names = parseDiseaseNames(body.disease_names);
    } catch {
      throw new BadRequestError("disease_names must be valid JSON");
    }
  }

  /* ---------- CHECK IF PRODUCT EXISTS ---------- */
  if (!(await findOwnedCompanyProductInDB(id, companyId))) throw new NotFoundError("Product not found");

  /* ---------- IMAGE HANDLING ---------- */
  const image = file ? await uploadFile({ file, folder: IMAGE_FOLDER }) : null;

  /* ---------- UPDATE (only provided fields change) ---------- */
  const changes = {};
  if (brand_id) changes.brandId = brand_id;
  if (category_id) changes.categoryId = category_id;
  if (sub_category_id) changes.subCategoryId = sub_category_id;
  if (product_name) changes.productName = product_name;
  if (description) changes.description = description;
  if (chemical_composition) changes.chemicalComposition = chemical_composition;
  if (crop_ids) changes.cropIds = crop_ids;
  if (disease_names) changes.diseaseNames = disease_names;
  if (image) changes.image = image;

  return updateCompanyProductInDB(id, companyId, changes);
}

export async function toggleCompanyProductStatus(id, companyId) {
  if (!(await findOwnedCompanyProductInDB(id, companyId))) throw new NotFoundError("Product not found");
  return toggleCompanyProductStatusInDB(id, companyId);
}

export async function deleteCompanyProduct(id, companyId) {
  const deleted = await deleteCompanyProductInDB(id, companyId);
  if (!deleted) throw new NotFoundError("Product not found");
  return deleted;
}

export async function deleteCompanyProducts(companyId, ids) {
  const deleted = await deleteCompanyProductsInDB(companyId, ids);
  if (deleted.length === 0) throw new NotFoundError("No products found to delete");
  return deleted;
}

/* ======================================================
   RECOMMENDATION (public, no auth)
====================================================== */

export async function getCompanyProductRecommendations({ cropName, diseaseName, chemicalComposition }) {
  if (!cropName && !diseaseName && !chemicalComposition) {
    // This endpoint's 400 has never followed the portal's envelope: `{ message, success: false }`.
    const message = "At least one of cropName, diseaseName or chemicalComposition is required";
    throw new BadRequestError(message, { body: { message, success: false } });
  }

  return findRecommendations({ cropName, diseaseName, chemicalComposition });
}
