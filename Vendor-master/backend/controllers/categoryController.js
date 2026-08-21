import pool from "../config/db.js";


  //  CREATE CATEGORY (VENDOR)

export const createCategory = async (req, res) => {
  const vendorId = req.vendor.id;
  const { brand_id } = req.body;
  const category_name = req.body.category_name?.trim();

  if (!brand_id || !category_name) {
    return res.status(400).json({
      success: false,
      message: "brand_id and category_name are required",
    });
  }

  try {
    // Check brand belongs to this vendor
    const brandCheck = await pool.query(
      `SELECT id FROM vendor_schema.brands
       WHERE id = $1 AND vendor_id = $2`,
      [brand_id, vendorId]
    );

    if (brandCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this vendor",
      });
    }

    // Case-insensitive duplicate check
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.categories
       WHERE LOWER(category_name) = LOWER($1)
       AND brand_id = $2
       AND vendor_id = $3`,
      [category_name, brand_id, vendorId]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists under this brand",
      });
    }

    const result = await pool.query(
      `INSERT INTO vendor_schema.categories
       (vendor_id, brand_id, category_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [vendorId, brand_id, category_name]
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
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
  
  // Pagination params with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vendor_schema.categories WHERE vendor_id = $1`,
      [vendorId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(
      `SELECT *
       FROM vendor_schema.categories
       WHERE vendor_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [vendorId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        categories: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
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
    const result = await pool.query(
      `SELECT *
       FROM vendor_schema.categories
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
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
    const { brand_id, category_name } = req.body;

    if (!brand_id || !category_name) {
      return res.status(400).json({
        success: false,
        message: "brand_id and category_name are required",
      });
    }

    // Check category exists
    const categoryExists = await pool.query(
      `SELECT *
       FROM vendor_schema.categories
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check brand belongs to vendor
    const brandCheck = await pool.query(
      `SELECT id FROM vendor_schema.brands
       WHERE id = $1 AND vendor_id = $2`,
      [brand_id, vendorId]
    );

    if (brandCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand_id or brand does not belong to this vendor",
      });
    }

    // Duplicate check
    const duplicate = await pool.query(
      `SELECT id FROM vendor_schema.categories
       WHERE category_name = $1
         AND brand_id = $2
         AND vendor_id = $3
         AND id != $4`,
      [category_name, brand_id, vendorId, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists under this brand",
      });
    }

    const updated = await pool.query(
      `UPDATE vendor_schema.categories
       SET brand_id = $1,
           category_name = $2,
           updated_at = NOW()
       WHERE id = $3 AND vendor_id = $4
       RETURNING *`,
      [brand_id, category_name, id, vendorId]
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated.rows[0],
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
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.categories
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await pool.query(
      `UPDATE vendor_schema.categories
       SET status = NOT status,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

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

    const existing = await pool.query(
      `SELECT *
       FROM vendor_schema.categories
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendorId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const deleted = await pool.query(
      `DELETE FROM vendor_schema.categories
       WHERE id = $1 AND vendor_id = $2
       RETURNING *`,
      [id, vendorId]
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: deleted.rows[0],
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
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of category IDs",
      });
    }

    // Convert to integers
    const categoryIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid category IDs provided",
      });
    }

    const result = await pool.query(
      `DELETE FROM vendor_schema.categories
       WHERE vendor_id = $1 AND id = ANY($2)
       RETURNING *`,
      [vendorId, categoryIds]
    );

    return res.status(200).json({
      success: true,
      message: `${result.rowCount} category(s) deleted successfully`,
      data: { deletedCount: result.rowCount, deletedIds: categoryIds },
    });

  } catch (error) {
    console.error("Bulk Delete Vendor Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete categories",
    });
  }
};
