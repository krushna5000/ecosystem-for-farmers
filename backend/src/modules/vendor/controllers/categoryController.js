import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { vendorBrands, vendorCategories } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";
import {
  now,
  ciEq,
  parsePagination,
  paginationMeta,
  pageByVendor,
  parseIdList,
  bulkDeleteByVendor,
} from "../utils/helpers.js";

const ownCategory = (id, vendorId) =>
  and(eq(vendorCategories.id, id), eq(vendorCategories.vendorId, vendorId));

const brandBelongsToVendor = async (brandId, vendorId) => {
  const [brand] = await db
    .select({ id: vendorBrands.id })
    .from(vendorBrands)
    .where(and(eq(vendorBrands.id, brandId), eq(vendorBrands.vendorId, vendorId)));
  return Boolean(brand);
};

//  CREATE CATEGORY (VENDOR)
export const createCategory = async (req, res) => {
  const vendorId = req.vendor.id;
  const { brand_id } = req.body ?? {};
  const category_name = req.body?.category_name?.trim();

  if (!brand_id || !category_name) {
    return res.status(400).json({
      success: false,
      message: "brand_id and category_name are required",
    });
  }

  try {
    if (!(await brandBelongsToVendor(brand_id, vendorId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this vendor",
      });
    }

    // Case-insensitive duplicate check
    const [exists] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(
        and(
          ciEq(vendorCategories.categoryName, category_name),
          eq(vendorCategories.brandId, brand_id),
          eq(vendorCategories.vendorId, vendorId),
        ),
      );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists under this brand",
      });
    }

    const [category] = await db
      .insert(vendorCategories)
      .values({ vendorId, brandId: brand_id, categoryName: category_name })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: snakeKeys(category),
    });
  } catch (error) {
    console.error("Create Vendor Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

//  GET ALL CATEGORIES - WITH PAGINATION
export const getAllCategories = async (req, res) => {
  const vendorId = req.vendor.id;
  const { page, limit, offset } = parsePagination(req.query);

  try {
    const { total, rows } = await pageByVendor(vendorCategories, vendorId, desc(vendorCategories.id), {
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        categories: snakeRows(rows),
        pagination: paginationMeta(total, page, limit),
      },
    });
  } catch (error) {
    console.error("Get Vendor Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

//  GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  try {
    const [category] = await db.select().from(vendorCategories).where(ownCategory(id, vendorId));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: snakeKeys(category),
    });
  } catch (error) {
    console.error("Get Vendor Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

//  UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const vendorId = req.vendor.id;
    const { brand_id, category_name } = req.body ?? {};

    if (!brand_id || !category_name) {
      return res.status(400).json({
        success: false,
        message: "brand_id and category_name are required",
      });
    }

    const [categoryExists] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(ownCategory(id, vendorId));

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!(await brandBelongsToVendor(brand_id, vendorId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this vendor",
      });
    }

    const [duplicate] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(
        and(
          eq(vendorCategories.categoryName, category_name),
          eq(vendorCategories.brandId, brand_id),
          eq(vendorCategories.vendorId, vendorId),
          ne(vendorCategories.id, id),
        ),
      );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists under this brand",
      });
    }

    const [updated] = await db
      .update(vendorCategories)
      .set({ brandId: brand_id, categoryName: category_name, updatedAt: now() })
      .where(ownCategory(id, vendorId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: snakeKeys(updated),
    });
  } catch (error) {
    console.error("Update Vendor Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

//  TOGGLE CATEGORY STATUS
export const toggleCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendor.id;

  try {
    const [exists] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(ownCategory(id, vendorId));

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await db
      .update(vendorCategories)
      .set({ status: sql`NOT ${vendorCategories.status}`, updatedAt: now() })
      .where(eq(vendorCategories.id, id));

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error("Toggle Vendor Category Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const vendorId = req.vendor.id;

    const [existing] = await db
      .select({ id: vendorCategories.id })
      .from(vendorCategories)
      .where(ownCategory(id, vendorId));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const [deleted] = await db.delete(vendorCategories).where(ownCategory(id, vendorId)).returning();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: snakeKeys(deleted),
    });
  } catch (error) {
    console.error("Delete Vendor Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

//  BULK DELETE CATEGORIES
export const deleteMultipleCategories = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const categoryIds = parseIdList(req.body?.ids);

    if (!categoryIds) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of category IDs",
      });
    }

    if (categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid category IDs provided",
      });
    }

    const deleted = await bulkDeleteByVendor(vendorCategories, vendorId, categoryIds);

    return res.status(200).json({
      success: true,
      message: `${deleted.length} category(s) deleted successfully`,
      data: { deletedCount: deleted.length, deletedIds: categoryIds },
    });
  } catch (error) {
    console.error("Bulk Delete Vendor Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete categories",
    });
  }
};
