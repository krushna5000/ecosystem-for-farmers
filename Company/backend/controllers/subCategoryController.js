import pool from "../config/db.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.util.js";

const success = (res, message, data = null) => {
  return res.status(200).json({
    status: "success",
    message,
    data,
  });
};

const failure = (res, message, code = 400) => {
  return res.status(code).json({
    status: "error",
    message,
  });
};

// CREATE SUB CATEGORY
export const createSubCategory = async (req, res) => {
  const company_id = req.company.id;
  const brand_id = req.body.brand_id;
  const category_id = req.body.category_id;
  const sub_category_name = req.body.sub_category_name?.trim();

  if (!brand_id || !category_id || !sub_category_name) {
    return failure(
      res,
      "brand_id, category_id and sub_category_name are required",
    );
  }

  try {
    // Validate brand
    const brandCheck = await pool.query(
      `SELECT id FROM company_schema.brands 
       WHERE id=$1 AND company_id=$2`,
      [brand_id, company_id],
    );

    if (brandCheck.rows.length === 0)
      return failure(res, "Invalid brand_id for this company");

    // Validate category
    const catCheck = await pool.query(
      `SELECT id FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [category_id, company_id],
    );

    if (catCheck.rows.length === 0)
      return failure(res, "Invalid category_id for this company");

    // ✅ Case-insensitive duplicate check
    const exists = await pool.query(
      `SELECT id FROM company_schema.sub_categories
       WHERE LOWER(sub_category_name) = LOWER($1)
         AND brand_id = $2
         AND category_id = $3
         AND company_id = $4`,
      [sub_category_name, brand_id, category_id, company_id],
    );

    if (exists.rows.length > 0)
      return failure(
        res,
        "Sub-category already exists under this brand & category",
      );

    // Insert
    const result = await pool.query(
      `INSERT INTO company_schema.sub_categories
        (company_id, brand_id, category_id, sub_category_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company_id, brand_id, category_id, sub_category_name],
    );

    return success(res, "Sub-category created successfully", result.rows[0]);
  } catch (err) {
    console.error("Create Sub-Category Error:", err);
    return failure(res, "Server error", 500);
  }
};

// GET ALL SUB CATEGORIES (non-paginated for dropdowns)
export const getAllSubCategories = async (req, res) => {
  const company_id = req.company.id;

  try {
    const result = await pool.query(
      `SELECT
          id,
          brand_id,
          category_id,
          sub_category_name,
          status
       FROM company_schema.sub_categories
       WHERE company_id = $1
       ORDER BY sub_category_name ASC`,
      [company_id],
    );

    return res.status(200).json({
      status: "success",
      message: "Sub-categories fetched successfully",

      data: result.rows,
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

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*)
       FROM company_schema.sub_categories
       WHERE company_id = $1`,
      [company_id],
    );

    const totalItems = parseInt(countResult.rows[0].count);

    // Paginated data
    const result = await pool.query(
      `SELECT
          id,
          brand_id,
          category_id,
          sub_category_name,
          status,
          created_at,
          updated_at
       FROM company_schema.sub_categories
       WHERE company_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [company_id, limit, offset],
    );

    return res.status(200).json({
      status: "success",

      message: "Sub-categories fetched successfully",

      data: result.rows,

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
    const result = await pool.query(
      `SELECT * FROM company_schema.sub_categories 
       WHERE id=$1 AND company_id=$2`,
      [id, company_id],
    );

    if (result.rows.length === 0)
      return failure(res, "Sub-category not found", 404);

    return success(res, "Sub-category fetched successfully", result.rows[0]);
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
    const { brand_id, category_id, sub_category_name, status } = req.body;

    // Check if sub-category exists
    const exists = await pool.query(
      `SELECT * FROM company_schema.sub_categories 
       WHERE id=$1 AND company_id=$2`,
      [id, company_id],
    );

    if (exists.rows.length === 0) {
      return failure(res, "Sub-category not found", 404);
    }

    // Update sub-category
    const updated = await pool.query(
      `UPDATE company_schema.sub_categories
       SET brand_id = COALESCE($1, brand_id),
           category_id = COALESCE($2, category_id),
           sub_category_name = COALESCE($3, sub_category_name),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id=$5 AND company_id=$6
       RETURNING *`,
      [
        brand_id || null,
        category_id || null,
        sub_category_name || null,
        status,
        id,
        company_id,
      ],
    );

    return success(res, "Sub-category updated successfully", updated.rows[0]);
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

    // Check if sub-category exists
    const exists = await pool.query(
      `SELECT id, status FROM company_schema.sub_categories WHERE id=$1`,
      [id],
    );

    if (exists.rows.length === 0) {
      return failure(res, "Sub-category not found", 404);
    }

    // Toggle status
    const updated = await pool.query(
      `UPDATE company_schema.sub_categories
       SET status = NOT status,
           updated_at = NOW()
       WHERE id=$1
       RETURNING id, status, updated_at`,
      [id],
    );

    return success(
      res,
      "Sub-category status updated successfully",
      updated.rows[0],
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

    const deleted = await pool.query(
      `DELETE FROM company_schema.sub_categories 
       WHERE id=$1 AND company_id=$2 
       RETURNING *`,
      [id, company_id],
    );

    if (deleted.rows.length === 0) {
      return failure(res, "Sub-category not found", 404);
    }

    // Return deleted row data
    return success(res, "Sub-category deleted successfully", deleted.rows[0]);
  } catch (err) {
    console.error("Delete SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};

// BULK DELETE SUB CATEGORIES
export const deleteSubCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of sub-category IDs is required");
    }

    // Validate all IDs are numbers
    const invalidIds = ids.filter((id) => isNaN(id));
    if (invalidIds.length > 0) {
      return failure(res, "Invalid sub-category ID format");
    }

    // Delete sub-categories and return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.sub_categories 
       WHERE id = ANY($1) AND company_id = $2 
       RETURNING *`,
      [ids, company_id],
    );

    if (deleted.rows.length === 0) {
      return failure(res, "No sub-categories found to delete", 404);
    }

    return success(
      res,
      `${deleted.rows.length} sub-category(ies) deleted successfully`,
      deleted.rows,
    );
  } catch (err) {
    console.error("Bulk Delete SubCategories Error:", err);
    return failure(res, "Server error", 500);
  }
};
