import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import {
  companyBrands,
  companyCategories,
  companySubCategories,
  companyProducts,
} from "../../../db/schema/index.js";
import { uploadFile } from "../../../utils/storage.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { findRecommendations } from "../recommendation/recommendation.service.js";
import { getPagination, getPaginationMeta } from "../../../utils/company/pagination.util.js";
import { statusSuccess as success, statusFailure as failure } from "../../../utils/company/response.js";
import {
  bodyOf,
  countOwned,
  findOwned,
  hasInvalidIds,
  nowSql,
  removeManyOwned,
  removeOwned,
} from "../../../utils/company/helpers.js";

const p = companyProducts;

// Multipart forms send arrays / objects as JSON strings; JSON bodies send them as-is.
const parseMaybeJson = (value) =>
  typeof value === "string" ? JSON.parse(value) : value;

const parseCropIds = (value) => {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
};

const parseDiseaseNames = (value) => {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) ? parsed : [parsed];
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const company_id = req.company.id;
    const body = bodyOf(req);

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
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return failure(res, "Invalid JSON format");
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
      return failure(
        res,
        "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required",
      );
    }

    /* ---------- Validate Brand / Category / Sub-Category ---------- */
    if (!(await findOwned(companyBrands, brand_id, company_id)))
      return failure(res, "Invalid brand_id");

    if (!(await findOwned(companyCategories, category_id, company_id)))
      return failure(res, "Invalid category_id");

    if (!(await findOwned(companySubCategories, sub_category_id, company_id)))
      return failure(res, "Invalid sub_category_id");

    /* ---------- Duplicate Product Check ---------- */
    const [exists] = await db
      .select({ id: p.id })
      .from(p)
      .where(
        and(
          sql`LOWER(${p.productName}) = LOWER(${product_name.trim()})`,
          eq(p.companyId, company_id),
        ),
      );

    if (exists) return failure(res, "Product already exists");

    /* ---------- Upload Image (Optional) ---------- */
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile({ file: req.file, folder: "company/products" });
    }

    /* ---------- Insert Product ---------- */
    const [product] = await db
      .insert(p)
      .values({
        companyId: company_id,
        brandId: brand_id,
        categoryId: category_id,
        subCategoryId: sub_category_id,
        productName: product_name.trim(),
        description: description || null,
        chemicalComposition: chemical_composition,
        cropIds: crop_ids,
        diseaseNames: disease_names,
        image: imageUrl,
      })
      .returning();

    return success(res, "Product created successfully", snakeKeys(product));
  } catch (error) {
    console.error("Create Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//GET ALL PRODUCTS (NON-PAGINATED FOR DROPDOWNS)
export const getAllProducts = async (req, res) => {
  try {
    const company_id = req.company.id;

    const rows = await db
      .select({
        id: p.id,
        productName: p.productName,
        brandId: p.brandId,
        categoryId: p.categoryId,
        subCategoryId: p.subCategoryId,
        categoryName: companyCategories.categoryName,
        subCategoryName: companySubCategories.subCategoryName,
        chemicalComposition: p.chemicalComposition,
        image: p.image,
        status: p.status,
      })
      .from(p)
      .leftJoin(companyCategories, eq(p.categoryId, companyCategories.id))
      .leftJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
      .where(eq(p.companyId, company_id))
      .orderBy(asc(p.productName));

    return res.status(200).json({
      status: "success",

      message: "Products fetched successfully",

      data: snakeRows(rows),
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    return failure(res, "Server error", 500);
  }
};

//GET ALL PRODUCTS (PAGINATED FOR TABLES)
export const getProductsTable = async (req, res) => {
  try {
    const company_id = req.company.id;

    const { page, limit, offset } = getPagination(req);

    const totalItems = await countOwned(p, company_id);

    const rows = await db
      .select({
        id: p.id,
        companyId: p.companyId,
        brandId: p.brandId,
        categoryId: p.categoryId,
        subCategoryId: p.subCategoryId,
        productName: p.productName,
        brandName: companyBrands.brandName,
        categoryName: companyCategories.categoryName,
        subCategoryName: companySubCategories.subCategoryName,
        description: p.description,
        chemicalComposition: p.chemicalComposition,
        cropIds: p.cropIds,
        diseaseNames: p.diseaseNames,
        image: p.image,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })
      .from(p)
      .innerJoin(companyBrands, eq(p.brandId, companyBrands.id))
      .innerJoin(companyCategories, eq(p.categoryId, companyCategories.id))
      .innerJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
      .where(eq(p.companyId, company_id))
      .orderBy(desc(p.id))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      status: "success",

      message: "Products fetched successfully",

      data: snakeRows(rows),

      pagination: getPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    });
  } catch (error) {
    console.error("Get Products Table Error:", error);

    return failure(res, "Server error", 500);
  }
};

//   GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const [row] = await db
      .select({
        ...getTableColumns(p),
        brandName: companyBrands.brandName,
        categoryName: companyCategories.categoryName,
        subCategoryName: companySubCategories.subCategoryName,
      })
      .from(p)
      .innerJoin(companyBrands, eq(p.brandId, companyBrands.id))
      .innerJoin(companyCategories, eq(p.categoryId, companyCategories.id))
      .innerJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
      .where(and(eq(p.id, id), eq(p.companyId, company_id)));

    if (!row) return failure(res, "Product not found", 404);

    return success(res, "Product fetched successfully", snakeKeys(row));
  } catch (error) {
    console.error(error);
    return failure(res, "Server error", 500);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) return failure(res, "Invalid product ID format", 400);

    const company_id = req.company.id;
    const body = bodyOf(req);

    const { brand_id, category_id, sub_category_id, product_name, description } = body;

    /* ---------- SAFE JSON PARSING ---------- */
    let chemical_composition = null;
    let crop_ids = null;
    let disease_names = null;

    if (body.chemical_composition) {
      try {
        chemical_composition = parseMaybeJson(body.chemical_composition);
      } catch (err) {
        return failure(res, "chemical_composition must be valid JSON");
      }
    }

    if (body.crop_ids) {
      try {
        crop_ids = parseCropIds(body.crop_ids);
      } catch (err) {
        return failure(res, "crop_ids must be valid JSON");
      }
    }

    if (body.disease_names) {
      try {
        disease_names = parseDiseaseNames(body.disease_names);
      } catch (err) {
        return failure(res, "disease_names must be valid JSON");
      }
    }

    /* ---------- CHECK IF PRODUCT EXISTS ---------- */
    const exists = await findOwned(p, id, company_id);
    if (!exists) return failure(res, "Product not found", 404);

    /* ---------- IMAGE HANDLING ---------- */
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile({ file: req.file, folder: "company/products" });
    }

    /* ---------- UPDATE (COALESCE semantics: only provided fields change) ---------- */
    const changes = { updatedAt: nowSql };
    if (brand_id) changes.brandId = brand_id;
    if (category_id) changes.categoryId = category_id;
    if (sub_category_id) changes.subCategoryId = sub_category_id;
    if (product_name) changes.productName = product_name;
    if (description) changes.description = description;
    if (chemical_composition) changes.chemicalComposition = chemical_composition;
    if (crop_ids) changes.cropIds = crop_ids;
    if (disease_names) changes.diseaseNames = disease_names;
    if (imageUrl) changes.image = imageUrl;

    const [updated] = await db
      .update(p)
      .set(changes)
      .where(and(eq(p.id, id), eq(p.companyId, company_id)))
      .returning();

    return success(res, "Product updated successfully", snakeKeys(updated));
  } catch (error) {
    console.error("Update Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

// TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (isNaN(id)) return failure(res, "Invalid product ID format", 400);

    // Scoped to the logged in company (the old queries looked up / updated by id only).
    const company_id = req.company.id;

    const exists = await findOwned(p, id, company_id);
    if (!exists) return failure(res, "Product not found", 404);

    const [updated] = await db
      .update(p)
      .set({ status: sql`NOT ${p.status}`, updatedAt: nowSql })
      .where(and(eq(p.id, id), eq(p.companyId, company_id)))
      .returning({ id: p.id, status: p.status, updatedAt: p.updatedAt });

    return success(res, "Product status updated successfully", snakeKeys(updated));
  } catch (error) {
    console.error("Toggle Product Status Error:", error);
    return failure(res, "Server error", 500);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const deleted = await removeOwned(p, id, company_id);

    if (!deleted) return failure(res, "Product not found", 404);

    return success(res, "Product deleted successfully", snakeKeys(deleted));
  } catch (error) {
    console.error("Delete Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

// BULK DELETE PRODUCTS
export const deleteProducts = async (req, res) => {
  try {
    const { ids } = bodyOf(req);
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of product IDs is required");
    }

    // Validate all IDs are numbers
    if (hasInvalidIds(ids)) {
      return failure(res, "Invalid product ID format");
    }

    // Delete products and return deleted data
    const deleted = await removeManyOwned(p, ids, company_id);

    if (deleted.length === 0) {
      return failure(res, "No products found to delete", 404);
    }

    return success(
      res,
      `${deleted.length} product(s) deleted successfully`,
      snakeRows(deleted),
    );
  } catch (error) {
    console.error("Bulk Delete Products Error:", error);
    return failure(res, "Server error", 500);
  }
};

/* ======================================================
   RECOMMENDATION (public, no auth)
====================================================== */

export const recommendationApi = async (req, res) => {
  try {
    const { cropName, diseaseName, chemicalComposition } = req.query;

    if (!cropName && !diseaseName && !chemicalComposition) {
      return res.status(400).json({
        message:
          "At least one of cropName, diseaseName or chemicalComposition is required",
        success: false,
      });
    }

    const { cropIdResolved, breakdown, data } = await findRecommendations({
      cropName,
      diseaseName,
      chemicalComposition,
    });

    return res.status(200).json({
      status: "success",
      message: `Found ${data.length} product(s)`,
      count: data.length,
      cropIdResolved,
      breakdown,
      data,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    return res.status(500).json({
      message: "server-side error",
      success: false,
      error: error.message,
    });
  }
};
