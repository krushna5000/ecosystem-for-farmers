import pool from "../config/db.js";


  //  RESPONSE HELPERS

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


  //  CREATE SUB CATEGORY

export const createSubCategory = async (req, res) => {
  const vendor_id = req.vendor.id;
  const { brand_id, category_id } = req.body;
  const sub_category_name = req.body.sub_category_name?.trim();

  if (!brand_id || !category_id || !sub_category_name) {
    return failure(
      res,
      "brand_id, category_id and sub_category_name are required"
    );
  }

  try {
    // Validate brand
    const brandCheck = await pool.query(
      `SELECT id FROM vendor_schema.brands 
       WHERE id=$1 AND vendor_id=$2`,
      [brand_id, vendor_id]
    );

    if (brandCheck.rows.length === 0)
      return failure(res, "Invalid brand_id for this vendor");

    // Validate category
    const catCheck = await pool.query(
      `SELECT id FROM vendor_schema.categories 
       WHERE id=$1 AND vendor_id=$2`,
      [category_id, vendor_id]
    );

    if (catCheck.rows.length === 0)
      return failure(res, "Invalid category_id for this vendor");

    // Case-insensitive duplicate check
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.sub_categories
       WHERE LOWER(sub_category_name) = LOWER($1)
         AND brand_id = $2
         AND category_id = $3
         AND vendor_id = $4`,
      [sub_category_name, brand_id, category_id, vendor_id]
    );

    if (exists.rows.length > 0)
      return failure(
        res,
        "Sub-category already exists under this brand & category"
      );

    // Insert
    const result = await pool.query(
      `INSERT INTO vendor_schema.sub_categories
        (vendor_id, brand_id, category_id, sub_category_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [vendor_id, brand_id, category_id, sub_category_name]
    );

    return success(
      res,
      "Sub-category created successfully",
      result.rows[0]
    );

  } catch (err) {
    console.error("Create Vendor Sub-Category Error:", err);
    return failure(res, "Server error", 500);
  }
};


  //  GET ALL SUB CATEGORIES - WITH PAGINATION

export const getAllSubCategories = async (req, res) => {
  const vendor_id = req.vendor.id;
  
  // Pagination params with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vendor_schema.sub_categories WHERE vendor_id = $1`,
      [vendor_id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(
      `SELECT *
       FROM vendor_schema.sub_categories
       WHERE vendor_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [vendor_id, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        subCategories: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (err) {
    console.error("Fetch Vendor SubCategories Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



  //  GET SUB CATEGORY BY ID

export const getSubCategoryById = async (req, res) => {
  const { id } = req.params;
  const vendor_id = req.vendor.id;

  try {
    const result = await pool.query(
      `SELECT * FROM vendor_schema.sub_categories
       WHERE id=$1 AND vendor_id=$2`,
      [id, vendor_id]
    );

    if (result.rows.length === 0)
      return failure(res, "Sub-category not found", 404);

    return success(res, "Sub-category fetched successfully", result.rows[0]);

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
    const { brand_id, category_id, sub_category_name, status } = req.body;

    // Check existence
    const exists = await pool.query(
      `SELECT * FROM vendor_schema.sub_categories
       WHERE id=$1 AND vendor_id=$2`,
      [id, vendor_id]
    );

    if (exists.rows.length === 0) {
      return failure(res, "Sub-category not found", 404);
    }

    // Update
    const updated = await pool.query(
      `UPDATE vendor_schema.sub_categories
       SET brand_id = COALESCE($1, brand_id),
           category_id = COALESCE($2, category_id),
           sub_category_name = COALESCE($3, sub_category_name),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id=$5 AND vendor_id=$6
       RETURNING *`,
      [
        brand_id || null,
        category_id || null,
        sub_category_name || null,
        status,
        id,
        vendor_id
      ]
    );

    return success(res, "Sub-category updated successfully", updated.rows[0]);

  } catch (err) {
    console.error("Update Vendor SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};


  //  TOGGLE STATUS

export const toggleSubCategoryStatus = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) {
      return failure(res, "Invalid sub-category ID format", 400);
    }

    const exists = await pool.query(
      `SELECT id, status FROM vendor_schema.sub_categories
       WHERE id=$1`,
      [id]
    );

    if (exists.rows.length === 0)
      return failure(res, "Sub-category not found", 404);

    const updated = await pool.query(
      `UPDATE vendor_schema.sub_categories
       SET status = NOT status,
           updated_at = NOW()
       WHERE id=$1
       RETURNING id, status, updated_at`,
      [id]
    );

    return success(
      res,
      "Sub-category status updated successfully",
      updated.rows[0]
    );

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

    const vendor_id = req.vendor.id;

    const deleted = await pool.query(
      `DELETE FROM vendor_schema.sub_categories
       WHERE id=$1 AND vendor_id=$2
       RETURNING *`,
      [id, vendor_id]
    );

    if (deleted.rows.length === 0)
      return failure(res, "Sub-category not found", 404);

    return success(
      res,
      "Sub-category deleted successfully",
      deleted.rows[0]
    );

  } catch (err) {
    console.error("Delete Vendor SubCategory Error:", err);
    return failure(res, "Server error", 500);
  }
};


  //  BULK DELETE SUB CATEGORIES

export const deleteMultipleSubCategories = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Please provide an array of sub-category IDs");
    }

    // Convert to integers
    const subCategoryIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (subCategoryIds.length === 0) {
      return failure(res, "No valid sub-category IDs provided");
    }

    const result = await pool.query(
      `DELETE FROM vendor_schema.sub_categories
       WHERE vendor_id = $1 AND id = ANY($2)
       RETURNING *`,
      [vendor_id, subCategoryIds]
    );

    return success(
      res,
      `${result.rowCount} sub-category(s) deleted successfully`,
      { deletedCount: result.rowCount, deletedIds: subCategoryIds }
    );

  } catch (err) {
    console.error("Bulk Delete Vendor SubCategories Error:", err);
    return failure(res, "Server error", 500);
  }
};
