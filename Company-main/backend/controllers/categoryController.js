import pool from "../config/db.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.util.js";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  const companyId = req.company.id;
  const brand_id = req.body.brand_id;
  const category_name = req.body.category_name?.trim();

  // Required fields check
  if (!brand_id || !category_name) {
    return res.status(400).json({
      success: false,
      message: "brand_id and category_name are required",
    });
  }

  try {
    // Validate brand exists and belongs to this company
    const brandCheck = await pool.query(
      `SELECT id FROM company_schema.brands 
       WHERE id = $1 AND company_id = $2`,
      [brand_id, companyId],
    );

    if (brandCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this company",
      });
    }

    //  Case-insensitive duplicate check
    const exists = await pool.query(
      `SELECT id FROM company_schema.categories 
       WHERE LOWER(category_name) = LOWER($1)
       AND brand_id = $2
       AND company_id = $3`,
      [category_name, brand_id, companyId],
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists under this brand",
      });
    }

    // Insert new category
    const result = await pool.query(
      `INSERT INTO company_schema.categories
       (company_id, brand_id, category_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, brand_id, category_name],
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
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
    const result = await pool.query(
      `SELECT
          id,
          brand_id,
          category_name,
          status
       FROM company_schema.categories
       WHERE company_id = $1
       ORDER BY category_name ASC`,
      [companyId],
    );

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: result.rows,
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

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*)
       FROM company_schema.categories
       WHERE company_id = $1`,
      [companyId],
    );

    const totalItems = parseInt(countResult.rows[0].count);

    // Paginated data
    const result = await pool.query(
      `SELECT
          id,
          brand_id,
          category_name,
          created_at,
          updated_at,
          status
       FROM company_schema.categories
       WHERE company_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset],
    );

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",

      data: result.rows,

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
    const result = await pool.query(
      `SELECT * FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category: result.rows[0],
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
    const { brand_id, category_name } = req.body;

    if (!brand_id || !category_name) {
      return res.status(400).json({
        success: false,
        message: "brand_id and category_name are required",
      });
    }

    // Check if category exists
    const categoryExists = await pool.query(
      `SELECT * FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [id, companyId],
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate brand exists
    const brandCheck = await pool.query(
      `SELECT id FROM company_schema.brands 
       WHERE id=$1 AND company_id=$2`,
      [brand_id, companyId],
    );

    if (brandCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this company",
      });
    }

    // Duplicate name check
    const duplicate = await pool.query(
      `SELECT id FROM company_schema.categories 
       WHERE category_name=$1 
         AND brand_id=$2 
         AND company_id=$3 
         AND id != $4`,
      [category_name, brand_id, companyId, id],
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Another category with this name already exists under this brand",
      });
    }

    // Update category
    const updated = await pool.query(
      `UPDATE company_schema.categories
       SET brand_id=$1, category_name=$2, updated_at=NOW()
       WHERE id=$3 AND company_id=$4
       RETURNING *`,
      [brand_id, category_name, id, companyId],
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated.rows[0],
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
    const exists = await pool.query(
      `SELECT id FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [id, companyId],
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.query(
      `UPDATE company_schema.categories 
       SET status = NOT status, updated_at = NOW()
       WHERE id=$1`,
      [id],
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

    // Check if category exists
    const existing = await pool.query(
      `SELECT * FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [id, companyId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete category & return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2 
       RETURNING *`,
      [id, companyId],
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deleted.rows[0],
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
    const { ids } = req.body;
    const companyId = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of category IDs is required",
      });
    }

    // Validate all IDs are numbers
    const invalidIds = ids.filter((id) => isNaN(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Delete categories and return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.categories 
       WHERE id = ANY($1) AND company_id = $2 
       RETURNING *`,
      [ids, companyId],
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found to delete",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${deleted.rows.length} category(ies) deleted successfully`,
      data: deleted.rows,
    });
  } catch (error) {
    console.error("Bulk Delete Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
