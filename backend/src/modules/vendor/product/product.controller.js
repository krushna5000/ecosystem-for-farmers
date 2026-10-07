import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import {
  vendorBrands,
  vendorCategories,
  vendorSubCategories,
  vendorProducts,
} from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";
import { uploadFile } from "../../../utils/storage.js";
import { success, failure } from "../../../utils/vendor/response.js";
import {
  now,
  ciEq,
  parsePagination,
  paginationMeta,
  parseIdList,
  bulkDeleteByVendor,
} from "../../../utils/vendor/helpers.js";

const IMAGE_FOLDER = "vendor-products";

const ownProduct = (id, vendorId) => and(eq(vendorProducts.id, id), eq(vendorProducts.vendorId, vendorId));

// products p JOIN brands b JOIN categories c JOIN sub_categories s  ->  p.*, brand_name, category_name, sub_category_name
const selectProductsWithNames = () =>
  db
    .select({
      product: vendorProducts,
      brand_name: vendorBrands.brandName,
      category_name: vendorCategories.categoryName,
      sub_category_name: vendorSubCategories.subCategoryName,
    })
    .from(vendorProducts)
    .innerJoin(vendorBrands, eq(vendorProducts.brandId, vendorBrands.id))
    .innerJoin(vendorCategories, eq(vendorProducts.categoryId, vendorCategories.id))
    .innerJoin(vendorSubCategories, eq(vendorProducts.subCategoryId, vendorSubCategories.id));

const flattenProduct = ({ product, ...names }) => ({ ...snakeKeys(product), ...names });

// multipart fields arrive as JSON strings; JSON bodies may already be parsed
const parseJsonField = (value) => (typeof value === "string" ? JSON.parse(value) : value);

const parseCropIds = (value) => {
  const parsed = parseJsonField(value);
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
};

//  CREATE PRODUCT (VENDOR)
export const createProduct = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const body = req.body ?? {};
    const { brand_id, category_id, sub_category_id, product_name, description } = body;

    let chemical_composition = [];
    let crop_ids = [];

    try {
      if (body.chemical_composition) {
        chemical_composition = parseJsonField(body.chemical_composition);
      }
      if (body.crop_ids) {
        crop_ids = parseCropIds(body.crop_ids);
      }
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return failure(res, "Invalid JSON format");
    }

    if (
      !brand_id ||
      !category_id ||
      !sub_category_id ||
      !product_name ||
      !chemical_composition?.length ||
      !crop_ids.length
    ) {
      return failure(
        res,
        "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required",
      );
    }

    const [brand] = await db
      .select({ id: vendorBrands.id })
      .from(vendorBrands)
      .where(and(eq(vendorBrands.id, brand_id), eq(vendorBrands.vendorId, vendor_id)));
    if (!brand) return failure(res, "Invalid brand_id");

    const [category] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(and(eq(vendorCategories.id, category_id), eq(vendorCategories.vendorId, vendor_id)));
    if (!category) return failure(res, "Invalid category_id");

    const [subcat] = await db
      .select({ id: vendorSubCategories.id })
      .from(vendorSubCategories)
      .where(and(eq(vendorSubCategories.id, sub_category_id), eq(vendorSubCategories.vendorId, vendor_id)));
    if (!subcat) return failure(res, "Invalid sub_category_id");

    const [exists] = await db
      .select({ id: vendorProducts.id })
      .from(vendorProducts)
      .where(and(ciEq(vendorProducts.productName, product_name.trim()), eq(vendorProducts.vendorId, vendor_id)));
    if (exists) return failure(res, "Product already exists");

    const image = req.file ? await uploadFile({ file: req.file, folder: IMAGE_FOLDER }) : null;

    const [product] = await db
      .insert(vendorProducts)
      .values({
        vendorId: vendor_id,
        brandId: brand_id,
        categoryId: category_id,
        subCategoryId: sub_category_id,
        productName: product_name.trim(),
        description: description || null,
        chemicalComposition: chemical_composition,
        cropIds: crop_ids,
        image,
      })
      .returning();

    return success(res, "Product created successfully", snakeKeys(product));
  } catch (error) {
    console.error("Create Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  GET ALL PRODUCTS (VENDOR) - WITH PAGINATION
export const getAllProducts = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const { page, limit, offset } = parsePagination(req.query);

    const [{ total }] = await db
      .select({ total: sql`COUNT(*)`.mapWith(Number) })
      .from(vendorProducts)
      .where(eq(vendorProducts.vendorId, vendor_id));

    const rows = await selectProductsWithNames()
      .where(eq(vendorProducts.vendorId, vendor_id))
      .orderBy(desc(vendorProducts.id))
      .limit(limit)
      .offset(offset);

    return success(res, "Products fetched successfully", {
      data: rows.map(flattenProduct),
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    console.error("Get Vendor Products Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await selectProductsWithNames().where(ownProduct(id, req.vendor.id));

    if (!row) return failure(res, "Product not found", 404);

    return success(res, "Product fetched successfully", flattenProduct(row));
  } catch (error) {
    console.error("Get Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) return failure(res, "Invalid product ID format");

    const vendor_id = req.vendor.id;
    const body = req.body ?? {};
    const { brand_id, category_id, sub_category_id, product_name, description } = body;

    let chemical_composition = null;
    let crop_ids = null;

    if (body.chemical_composition) {
      try {
        chemical_composition = parseJsonField(body.chemical_composition);
      } catch {
        return failure(res, "chemical_composition must be valid JSON");
      }
    }

    if (body.crop_ids) {
      try {
        crop_ids = parseCropIds(body.crop_ids);
      } catch {
        return failure(res, "crop_ids must be valid JSON");
      }
    }

    const [exists] = await db
      .select({ id: vendorProducts.id })
      .from(vendorProducts)
      .where(ownProduct(id, vendor_id));

    if (!exists) return failure(res, "Product not found", 404);

    // Only provided fields change (COALESCE semantics of the old query)
    const changes = { updatedAt: now() };
    if (brand_id) changes.brandId = brand_id;
    if (category_id) changes.categoryId = category_id;
    if (sub_category_id) changes.subCategoryId = sub_category_id;
    if (product_name) changes.productName = product_name;
    if (description) changes.description = description;
    if (chemical_composition != null) changes.chemicalComposition = chemical_composition;
    if (crop_ids != null) changes.cropIds = crop_ids;
    if (req.file) changes.image = await uploadFile({ file: req.file, folder: IMAGE_FOLDER });

    const [updated] = await db
      .update(vendorProducts)
      .set(changes)
      .where(ownProduct(id, vendor_id))
      .returning();

    return success(res, "Product updated successfully", snakeKeys(updated));
  } catch (error) {
    console.error("Update Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const [exists] = await db
      .select({ id: vendorProducts.id })
      .from(vendorProducts)
      .where(ownProduct(id, vendor_id));

    if (!exists) return failure(res, "Product not found", 404);

    const [updated] = await db
      .update(vendorProducts)
      .set({ status: sql`NOT ${vendorProducts.status}`, updatedAt: now() })
      .where(ownProduct(id, vendor_id))
      .returning({
        id: vendorProducts.id,
        status: vendorProducts.status,
        updated_at: vendorProducts.updatedAt,
      });

    return success(res, "Product status updated successfully", updated);
  } catch (error) {
    console.error("Toggle Vendor Product Status Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db.delete(vendorProducts).where(ownProduct(id, req.vendor.id)).returning();

    if (!deleted) return failure(res, "Product not found", 404);

    return success(res, "Product deleted successfully", snakeKeys(deleted));
  } catch (error) {
    console.error("Delete Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//  BULK DELETE PRODUCTS
export const deleteMultipleProducts = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const productIds = parseIdList(req.body?.ids);

    if (!productIds) {
      return failure(res, "Please provide an array of product IDs");
    }

    if (productIds.length === 0) {
      return failure(res, "No valid product IDs provided");
    }

    const deleted = await bulkDeleteByVendor(vendorProducts, vendor_id, productIds);

    return success(res, `${deleted.length} product(s) deleted successfully`, {
      deletedCount: deleted.length,
      deletedIds: productIds,
    });
  } catch (error) {
    console.error("Bulk Delete Vendor Products Error:", error);
    return failure(res, "Server error", 500);
  }
};

const filteredProducts = (column, label) => async (req, res) => {
  try {
    const value = req.params[column.paramName];

    const rows = await selectProductsWithNames()
      .where(and(eq(vendorProducts.vendorId, req.vendor.id), eq(column.column, value)))
      .orderBy(desc(vendorProducts.id));

    return success(res, "Products fetched successfully", rows.map(flattenProduct));
  } catch (error) {
    console.error(`Get Vendor Products By ${label} Error:`, error);
    return failure(res, "Server error", 500);
  }
};

//  GET PRODUCTS BY BRAND / CATEGORY / SUBCATEGORY
export const getProductsByBrand = filteredProducts(
  { paramName: "brand_id", column: vendorProducts.brandId },
  "Brand",
);
export const getProductsByCategory = filteredProducts(
  { paramName: "category_id", column: vendorProducts.categoryId },
  "Category",
);
export const getProductsBySubCategory = filteredProducts(
  { paramName: "sub_category_id", column: vendorProducts.subCategoryId },
  "SubCategory",
);
