import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { companyBrands, companyCategories } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { getPagination, getPaginationMeta } from "../../../utils/company/pagination.util.js";
import {
  bodyOf,
  countOwned,
  findOwned,
  hasInvalidIds,
  nowSql,
  pickCols,
  removeManyOwned,
  removeOwned,
} from "../../../utils/company/helpers.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  const companyId = req.company.id;
  const body = bodyOf(req);
  const brand_id = body.brand_id;
  const category_name = body.category_name?.trim();

  // Required fields check
  if (!brand_id || !category_name) {
    return res.status(400).json({
      success: false,
      message: "brand_id and category_name are required",
    });
  }

  try {
    // Validate brand exists and belongs to this company
    const brand = await findOwned(companyBrands, brand_id, companyId);

    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this company",
      });
    }

    //  Case-insensitive duplicate check
    const [exists] = await db
      .select({ id: companyCategories.id })
      .from(companyCategories)
      .where(
        and(
          sql`LOWER(${companyCategories.categoryName}) = LOWER(${category_name})`,
          eq(companyCategories.brandId, brand_id),
          eq(companyCategories.companyId, companyId),
        ),
      );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists under this brand",
      });
    }

    // Insert new category
    const [category] = await db
      .insert(companyCategories)
      .values({ companyId, brandId: brand_id, categoryName: category_name })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: snakeKeys(category),
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET ALL CATEGORIES for dropdowns(non-paginated)
export const getAllCategories = async (req, res) => {
  const companyId = req.company.id;

  try {
    const rows = await db
      .select(
        pickCols(companyCategories, ["id", "brandId", "categoryName", "status"]),
      )
      .from(companyCategories)
      .where(eq(companyCategories.companyId, companyId))
      .orderBy(asc(companyCategories.categoryName));

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: snakeRows(rows),
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//GET ALL CATEGORIES (PAGINATED DATA FOR TABLES)
export const getCategoriesTable = async (req, res) => {
  const companyId = req.company.id;

  try {
    const { page, limit, offset } = getPagination(req);

    const totalItems = await countOwned(companyCategories, companyId);

    const rows = await db
      .select(
        pickCols(companyCategories, [
          "id",
          "brandId",
          "categoryName",
          "createdAt",
          "updatedAt",
          "status",
        ]),
      )
      .from(companyCategories)
      .where(eq(companyCategories.companyId, companyId))
      .orderBy(desc(companyCategories.id))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",

      data: snakeRows(rows),

      pagination: getPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    });
  } catch (error) {
    console.error("Get Categories Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const companyId = req.company.id;

  try {
    const category = await findOwned(companyCategories, id, companyId);

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
    console.error("Get Category Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Fix whitespace/newline issue

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const companyId = req.company.id;
    const { brand_id, category_name } = bodyOf(req);

    if (!brand_id || !category_name) {
      return res.status(400).json({
        success: false,
        message: "brand_id and category_name are required",
      });
    }

    // Check if category exists
    const categoryExists = await findOwned(companyCategories, id, companyId);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate brand exists
    const brand = await findOwned(companyBrands, brand_id, companyId);

    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this company",
      });
    }

    // Duplicate name check
    const [duplicate] = await db
      .select({ id: companyCategories.id })
      .from(companyCategories)
      .where(
        and(
          eq(companyCategories.categoryName, category_name),
          eq(companyCategories.brandId, brand_id),
          eq(companyCategories.companyId, companyId),
          ne(companyCategories.id, id),
        ),
      );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Another category with this name already exists under this brand",
      });
    }

    // Update category
    const [updated] = await db
      .update(companyCategories)
      .set({ brandId: brand_id, categoryName: category_name, updatedAt: nowSql })
      .where(
        and(eq(companyCategories.id, id), eq(companyCategories.companyId, companyId)),
      )
      .returning();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: snakeKeys(updated),
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// TOGGLE STATUS (Active/Inactive)
export const toggleCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const companyId = req.company.id;

  try {
    const exists = await findOwned(companyCategories, id, companyId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await db
      .update(companyCategories)
      .set({ status: sql`NOT ${companyCategories.status}`, updatedAt: nowSql })
      .where(
        and(eq(companyCategories.id, id), eq(companyCategories.companyId, companyId)),
      );

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Fix whitespace/newline issues

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const companyId = req.company.id;

    const deleted = await removeOwned(companyCategories, id, companyId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: snakeKeys(deleted),
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// BULK DELETE CATEGORIES
export const deleteCategories = async (req, res) => {
  try {
    const { ids } = bodyOf(req);
    const companyId = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of category IDs is required",
      });
    }

    // Validate all IDs are numbers
    if (hasInvalidIds(ids)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Delete categories and return deleted data
    const deleted = await removeManyOwned(companyCategories, ids, companyId);

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${deleted.length} category(ies) deleted successfully`,
      data: snakeRows(deleted),
    });
  } catch (error) {
    console.error("Bulk Delete Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
