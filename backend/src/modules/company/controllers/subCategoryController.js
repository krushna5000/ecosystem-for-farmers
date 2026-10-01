import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  companyBrands,
  companyCategories,
  companySubCategories,
} from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.util.js";
import { statusSuccess as success, statusFailure as failure } from "../utils/response.js";
import {
  bodyOf,
  countOwned,
  findOwned,
  hasInvalidIds,
  nowSql,
  pickCols,
  removeManyOwned,
  removeOwned,
  toBool,
} from "../utils/helpers.js";

// CREATE SUB CATEGORY
export const createSubCategory = async (req, res) => {
  const company_id = req.company.id;
  const body = bodyOf(req);
  const brand_id = body.brand_id;
  const category_id = body.category_id;
  const sub_category_name = body.sub_category_name?.trim();

  if (!brand_id || !category_id || !sub_category_name) {
    return failure(
      res,
      "brand_id, category_id and sub_category_name are required",
    );
  }

  try {
    // Validate brand
    const brand = await findOwned(companyBrands, brand_id, company_id);
    if (!brand) return failure(res, "Invalid brand_id for this company");

    // Validate category
    const category = await findOwned(companyCategories, category_id, company_id);
    if (!category) return failure(res, "Invalid category_id for this company");

    // Case-insensitive duplicate check
    const [exists] = await db
      .select({ id: companySubCategories.id })
      .from(companySubCategories)
      .where(
        and(
          sql`LOWER(${companySubCategories.subCategoryName}) = LOWER(${sub_category_name})`,
          eq(companySubCategories.brandId, brand_id),
          eq(companySubCategories.categoryId, category_id),
          eq(companySubCategories.companyId, company_id),
        ),
      );

    if (exists)
      return failure(
        res,
        "Sub-category already exists under this brand & category",
      );

    // Insert
    const [subCategory] = await db
      .insert(companySubCategories)
      .values({
        companyId: company_id,
        brandId: brand_id,
        categoryId: category_id,
        subCategoryName: sub_category_name,
      })
      .returning();

    return success(res, "Sub-category created successfully", snakeKeys(subCategory));
  } catch (err) {
    console.error("Create Sub-Category Error:", err);
    return failure(res, "Server error", 500);
  }
};

// GET ALL SUB CATEGORIES (non-paginated for dropdowns)
export const getAllSubCategories = async (req, res) => {
  const company_id = req.company.id;

  try {
    const rows = await db
      .select(
        pickCols(companySubCategories, [
          "id",
          "brandId",
          "categoryId",
          "subCategoryName",
          "status",
        ]),
      )
      .from(companySubCategories)
      .where(eq(companySubCategories.companyId, company_id))
      .orderBy(asc(companySubCategories.subCategoryName));

    return res.status(200).json({
      status: "success",
      message: "Sub-categories fetched successfully",

      data: snakeRows(rows),
    });
  } catch (err) {
    console.error("Get All SubCategories Error:", err);

    return failure(res, "Server error", 500);
  }
};

//GET ALL SUB CATEGORIES (PAGINATED DATA FOR TABLES)
export const getSubCategoriesTable = async (req, res) => {
  const company_id = req.company.id;

  try {
    const { page, limit, offset } = getPagination(req);

    const totalItems = await countOwned(companySubCategories, company_id);

    const rows = await db
      .select(
        pickCols(companySubCategories, [
          "id",
          "brandId",
          "categoryId",
          "subCategoryName",
          "status",
          "createdAt",
          "updatedAt",
        ]),
      )
      .from(companySubCategories)
      .where(eq(companySubCategories.companyId, company_id))
      .orderBy(desc(companySubCategories.id))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      status: "success",

      message: "Sub-categories fetched successfully",

      data: snakeRows(rows),

      pagination: getPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    });
  } catch (err) {
    console.error("Get SubCategories Table Error:", err);

    return failure(res, "Server error", 500);
  }
};

// GET SUB CATEGORY BY ID
export const getSubCategoryById = async (req, res) => {
  const { id } = req.params;
  const company_id = req.company.id;

  try {
    const row = await findOwned(companySubCategories, id, company_id);

    if (!row) return failure(res, "Sub-category not found", 404);

    return success(res, "Sub-category fetched successfully", snakeKeys(row));
  } catch (err) {
    console.error(err);
    return failure(res, "Server error", 500);
  }
};

// UPDATE SUB CATEGORY
export const updateSubCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Prevent space/newline issues

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const company_id = req.company.id;
    const { brand_id, category_id, sub_category_name, status } = bodyOf(req);

    // Check if sub-category exists
    const exists = await findOwned(companySubCategories, id, company_id);

    if (!exists) {
      return failure(res, "Sub-category not found", 404);
    }

    // Update sub-category (COALESCE semantics: only provided fields change)
    const changes = { updatedAt: nowSql };
    if (brand_id) changes.brandId = brand_id;
    if (category_id) changes.categoryId = category_id;
    if (sub_category_name) changes.subCategoryName = sub_category_name;
    if (status != null) changes.status = toBool(status);

    const [updated] = await db
      .update(companySubCategories)
      .set(changes)
      .where(
        and(
          eq(companySubCategories.id, id),
          eq(companySubCategories.companyId, company_id),
        ),
      )
      .returning();

    return success(res, "Sub-category updated successfully", snakeKeys(updated));
  } catch (err) {
    console.error("Update SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

// TOGGLE STATUS
export const toggleSubCategoryStatus = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Remove spaces or newline characters

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    // Scoped to the logged in company (the old queries looked up / updated by id only).
    const exists = await findOwned(companySubCategories, id, req.company.id);

    if (!exists) {
      return failure(res, "Sub-category not found", 404);
    }

    // Toggle status
    const [updated] = await db
      .update(companySubCategories)
      .set({ status: sql`NOT ${companySubCategories.status}`, updatedAt: nowSql })
      .where(
        and(
          eq(companySubCategories.id, id),
          eq(companySubCategories.companyId, req.company.id),
        ),
      )
      .returning(
        pickCols(companySubCategories, ["id", "status", "updatedAt"]),
      );

    return success(
      res,
      "Sub-category status updated successfully",
      snakeKeys(updated),
    );
  } catch (err) {
    console.error("Toggle Subcategory Status Error:", err);
    return failure(res, "Server error", 500);
  }
};

// DELETE SUB CATEGORY
export const deleteSubCategory = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim(); // Remove spaces/newline characters

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const company_id = req.company.id;

    const deleted = await removeOwned(companySubCategories, id, company_id);

    if (!deleted) {
      return failure(res, "Sub-category not found", 404);
    }

    // Return deleted row data
    return success(res, "Sub-category deleted successfully", snakeKeys(deleted));
  } catch (err) {
    console.error("Delete SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

// BULK DELETE SUB CATEGORIES
export const deleteSubCategories = async (req, res) => {
  try {
    const { ids } = bodyOf(req);
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of sub-category IDs is required");
    }

    // Validate all IDs are numbers
    if (hasInvalidIds(ids)) {
      return failure(res, "Invalid sub-category ID format");
    }

    // Delete sub-categories and return deleted data
    const deleted = await removeManyOwned(companySubCategories, ids, company_id);

    if (deleted.length === 0) {
      return failure(res, "No sub-categories found to delete", 404);
    }

    return success(
      res,
      `${deleted.length} sub-category(ies) deleted successfully`,
      snakeRows(deleted),
    );
  } catch (err) {
    console.error("Bulk Delete SubCategories Error:", err);
    return failure(res, "Server error", 500);
  }
};
