import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { vendorBrands, vendorCategories, vendorSubCategories } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { success, failure } from "../../../utils/vendor/response.js";
import {
  now,
  ciEq,
  toBoolean,
  parsePagination,
  paginationMeta,
  pageByVendor,
  parseIdList,
  bulkDeleteByVendor,
} from "../../../utils/vendor/helpers.js";

const ownSubCategory = (id, vendorId) =>
  and(eq(vendorSubCategories.id, id), eq(vendorSubCategories.vendorId, vendorId));

//  CREATE SUB CATEGORY
export const createSubCategory = async (req, res) => {
  const vendor_id = req.vendor.id;
  const { brand_id, category_id } = req.body ?? {};
  const sub_category_name = req.body?.sub_category_name?.trim();

  if (!brand_id || !category_id || !sub_category_name) {
    return failure(res, "brand_id, category_id and sub_category_name are required");
  }

  try {
    const [brandCheck] = await db
      .select({ id: vendorBrands.id })
      .from(vendorBrands)
      .where(and(eq(vendorBrands.id, brand_id), eq(vendorBrands.vendorId, vendor_id)));

    if (!brandCheck) return failure(res, "Invalid brand_id for this vendor");

    const [catCheck] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(and(eq(vendorCategories.id, category_id), eq(vendorCategories.vendorId, vendor_id)));

    if (!catCheck) return failure(res, "Invalid category_id for this vendor");

    // Case-insensitive duplicate check
    const [exists] = await db
      .select({ id: vendorSubCategories.id })
      .from(vendorSubCategories)
      .where(
        and(
          ciEq(vendorSubCategories.subCategoryName, sub_category_name),
          eq(vendorSubCategories.brandId, brand_id),
          eq(vendorSubCategories.categoryId, category_id),
          eq(vendorSubCategories.vendorId, vendor_id),
        ),
      );

    if (exists) return failure(res, "Sub-category already exists under this brand & category");

    const [subCategory] = await db
      .insert(vendorSubCategories)
      .values({
        vendorId: vendor_id,
        brandId: brand_id,
        categoryId: category_id,
        subCategoryName: sub_category_name,
      })
      .returning();

    return success(res, "Sub-category created successfully", snakeKeys(subCategory));
  } catch (err) {
    console.error("Create Vendor Sub-Category Error:", err);
    return failure(res, "Server error", 500);
  }
};

//  GET ALL SUB CATEGORIES - WITH PAGINATION
export const getAllSubCategories = async (req, res) => {
  const vendor_id = req.vendor.id;
  const { page, limit, offset } = parsePagination(req.query);

  try {
    const { total, rows } = await pageByVendor(vendorSubCategories, vendor_id, desc(vendorSubCategories.id), {
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        subCategories: snakeRows(rows),
        pagination: paginationMeta(total, page, limit),
      },
    });
  } catch (err) {
    console.error("Fetch Vendor SubCategories Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  GET SUB CATEGORY BY ID (not routed in the old server either)
export const getSubCategoryById = async (req, res) => {
  const { id } = req.params;
  const vendor_id = req.vendor.id;

  try {
    const [subCategory] = await db.select().from(vendorSubCategories).where(ownSubCategory(id, vendor_id));

    if (!subCategory) return failure(res, "Sub-category not found", 404);

    return success(res, "Sub-category fetched successfully", snakeKeys(subCategory));
  } catch (err) {
    console.error(err);
    return failure(res, "Server error", 500);
  }
};

//  UPDATE SUB CATEGORY
export const updateSubCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const vendor_id = req.vendor.id;
    const { brand_id, category_id, sub_category_name, status } = req.body ?? {};

    const [exists] = await db
      .select({ id: vendorSubCategories.id })
      .from(vendorSubCategories)
      .where(ownSubCategory(id, vendor_id));

    if (!exists) {
      return failure(res, "Sub-category not found", 404);
    }

    const changes = { updatedAt: now() };
    if (brand_id) changes.brandId = brand_id;
    if (category_id) changes.categoryId = category_id;
    if (sub_category_name) changes.subCategoryName = sub_category_name;
    if (status != null) changes.status = toBoolean(status);

    const [updated] = await db
      .update(vendorSubCategories)
      .set(changes)
      .where(ownSubCategory(id, vendor_id))
      .returning();

    return success(res, "Sub-category updated successfully", snakeKeys(updated));
  } catch (err) {
    console.error("Update Vendor SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

//  TOGGLE STATUS
// NOTE: like the old code, this is NOT scoped to the authenticated vendor (see docs/routes/vendor.md).
export const toggleSubCategoryStatus = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const [exists] = await db
      .select({ id: vendorSubCategories.id })
      .from(vendorSubCategories)
      .where(eq(vendorSubCategories.id, id));

    if (!exists) return failure(res, "Sub-category not found", 404);

    const [updated] = await db
      .update(vendorSubCategories)
      .set({ status: sql`NOT ${vendorSubCategories.status}`, updatedAt: now() })
      .where(eq(vendorSubCategories.id, id))
      .returning({
        id: vendorSubCategories.id,
        status: vendorSubCategories.status,
        updated_at: vendorSubCategories.updatedAt,
      });

    return success(res, "Sub-category status updated successfully", updated);
  } catch (err) {
    console.error("Toggle Vendor SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

//  DELETE SUB CATEGORY
export const deleteSubCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const [deleted] = await db
      .delete(vendorSubCategories)
      .where(ownSubCategory(id, req.vendor.id))
      .returning();

    if (!deleted) return failure(res, "Sub-category not found", 404);

    return success(res, "Sub-category deleted successfully", snakeKeys(deleted));
  } catch (err) {
    console.error("Delete Vendor SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

//  BULK DELETE SUB CATEGORIES
export const deleteMultipleSubCategories = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const subCategoryIds = parseIdList(req.body?.ids);

    if (!subCategoryIds) {
      return failure(res, "Please provide an array of sub-category IDs");
    }

    if (subCategoryIds.length === 0) {
      return failure(res, "No valid sub-category IDs provided");
    }

    const deleted = await bulkDeleteByVendor(vendorSubCategories, vendor_id, subCategoryIds);

    return success(res, `${deleted.length} sub-category(s) deleted successfully`, {
      deletedCount: deleted.length,
      deletedIds: subCategoryIds,
    });
  } catch (err) {
    console.error("Bulk Delete Vendor SubCategories Error:", err);
    return failure(res, "Server error", 500);
  }
};
