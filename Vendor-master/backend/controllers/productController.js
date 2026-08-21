import pool from "../config/db.js";
import { uploadToS3 } from "../config/s3.js";


  //  Response Helpers

const success = (res, message, data = null) => {
  return res.status(200).json({ status: "success", message, data });
};

const failure = (res, message, code = 400) => {
  return res.status(code).json({ status: "error", message });
};


  //  CREATE PRODUCT (VENDOR)

export const createProduct = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;

    const {
      brand_id,
      category_id,
      sub_category_id,
      product_name,
      description,
      
    } = req.body;

    //parsing chemical composition and crop_id
    // SAFE JSON PARSING

let chemical_composition = [];
let crop_ids = [];

try {
  // Parse chemical_composition
  if (req.body.chemical_composition) {
    chemical_composition =
      typeof req.body.chemical_composition === "string"
        ? JSON.parse(req.body.chemical_composition)
        : req.body.chemical_composition;
  }

  // Parse crop_ids
  if (req.body.crop_ids) {
    const parsed =
      typeof req.body.crop_ids === "string"
        ? JSON.parse(req.body.crop_ids)
        : req.body.crop_ids;

    crop_ids = Array.isArray(parsed)
      ? parsed.map(Number)
      : [Number(parsed)];
  }
} catch (err) {
  console.error("JSON Parse Error:", err);
  return failure(res, "Invalid JSON format");
}




    const image = req.file
      ? await uploadToS3(req.file, "products")
      : null;

    // ✅ Validation
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
        "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required"
      );
    }

    /* Validate Brand */
    const brand = await pool.query(
      `SELECT id FROM vendor_schema.brands 
       WHERE id=$1 AND vendor_id=$2`,
      [brand_id, vendor_id]
    );
    if (brand.rows.length === 0)
      return failure(res, "Invalid brand_id");

    /* Validate Category */
    const category = await pool.query(
      `SELECT id FROM vendor_schema.categories 
       WHERE id=$1 AND vendor_id=$2`,
      [category_id, vendor_id]
    );
    if (category.rows.length === 0)
      return failure(res, "Invalid category_id");

    /* Validate Sub Category */
    const subcat = await pool.query(
      `SELECT id FROM vendor_schema.sub_categories 
       WHERE id=$1 AND vendor_id=$2`,
      [sub_category_id, vendor_id]
    );
    if (subcat.rows.length === 0)
      return failure(res, "Invalid sub_category_id");

    /* Duplicate product check */
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.products
       WHERE LOWER(product_name) = LOWER($1)
       AND vendor_id = $2`,
      [product_name.trim(), vendor_id]
    );

    if (exists.rows.length > 0)
      return failure(res, "Product already exists");

    /* Insert Product */
    const result = await pool.query(
      `INSERT INTO vendor_schema.products
       (vendor_id, brand_id, category_id, sub_category_id,
        product_name, description, chemical_composition, crop_ids, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        vendor_id,
        brand_id,
        category_id,
        sub_category_id,
        product_name.trim(),
        description || null,
        JSON.stringify(chemical_composition),
        crop_ids,
        image
      ]
    );

    return success(res, "Product created successfully", result.rows[0]);

  } catch (error) {
    console.error("Create Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  GET ALL PRODUCTS (VENDOR) - WITH PAGINATION

export const getAllProducts = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    
    // Pagination params with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vendor_schema.products WHERE vendor_id = $1`,
      [vendor_id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const result = await pool.query(`
      SELECT 
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM vendor_schema.products p
      JOIN vendor_schema.brands b ON p.brand_id = b.id
      JOIN vendor_schema.categories c ON p.category_id = c.id
      JOIN vendor_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.vendor_id = $1
      ORDER BY p.id DESC
      LIMIT $2 OFFSET $3
    `, [vendor_id, limit, offset]);

    return success(res, "Products fetched successfully", {
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    return success(res, "Products fetched successfully", result.rows);
    

  } catch (error) {
    console.error("Get Vendor Products Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  GET PRODUCT BY ID

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const result = await pool.query(`
      SELECT 
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM vendor_schema.products p
      JOIN vendor_schema.brands b ON p.brand_id = b.id
      JOIN vendor_schema.categories c ON p.category_id = c.id
      JOIN vendor_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.id=$1 AND p.vendor_id=$2
    `, [id, vendor_id]);

    if (result.rows.length === 0)
      return failure(res, "Product not found", 404);

    return success(res, "Product fetched successfully", result.rows[0]);

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

    if (isNaN(id))
      return failure(res, "Invalid product ID format");

    const vendor_id = req.vendor.id;

    const {
      brand_id,
      category_id,
      sub_category_id,
      product_name,
      description
    } = req.body;

    /* =============================
       SAFE JSON PARSING
    ============================== */

    let chemical_composition = null;
    
    let crop_ids = null;

    // 🔹 Parse chemical_composition
if (req.body.chemical_composition) {
  try {
    chemical_composition =
      typeof req.body.chemical_composition === "string"
        ? JSON.parse(req.body.chemical_composition)
        : req.body.chemical_composition;

  } catch (err) {
    return failure(res, "chemical_composition must be valid JSON");
  }
}

    // 🔹 Parse crop_ids
    if (req.body.crop_ids) {
      try {
        const parsed =
          typeof req.body.crop_ids === "string"
            ? JSON.parse(req.body.crop_ids)
            : req.body.crop_ids;

        crop_ids = Array.isArray(parsed)
          ? parsed.map(Number)
          : [Number(parsed)];
      } catch (err) {
        return failure(res, "crop_ids must be valid JSON");
      }
    }

    /* =============================
       CHECK IF PRODUCT EXISTS
    ============================== */

    const exists = await pool.query(
      `SELECT id FROM vendor_schema.products
       WHERE id=$1 AND vendor_id=$2`,
      [id, vendor_id]
    );

    if (exists.rows.length === 0)
      return failure(res, "Product not found", 404);

    /* =============================
       IMAGE HANDLING
    ============================== */

    let newImage = null;

    if (req.file) {
      newImage = await uploadToS3(req.file, "products");
    }

    /* =============================
       UPDATE QUERY
    ============================== */

    const updated = await pool.query(
      `UPDATE vendor_schema.products
       SET brand_id = COALESCE($1, brand_id),
           category_id = COALESCE($2, category_id),
           sub_category_id = COALESCE($3, sub_category_id),
           product_name = COALESCE($4, product_name),
           description = COALESCE($5, description),
           chemical_composition = COALESCE($6, chemical_composition),
           crop_ids = COALESCE($7, crop_ids),
           image = COALESCE($8, image),
           updated_at = NOW()
       WHERE id=$9 AND vendor_id=$10
       RETURNING *`,
      [
        brand_id || null,
        category_id || null,
        sub_category_id || null,
        product_name || null,
        description || null,
        JSON.stringify(chemical_composition), // json/jsonb
        crop_ids,               // integer[]
        newImage,
        id,
        vendor_id
      ]
    );

    return success(res, "Product updated successfully", updated.rows[0]);

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

    const exists = await pool.query(
      `SELECT id FROM vendor_schema.products
       WHERE id=$1 AND vendor_id=$2`,
      [id, vendor_id]
    );

    if (exists.rows.length === 0)
      return failure(res, "Product not found", 404);

    const updated = await pool.query(
      `UPDATE vendor_schema.products
       SET status = NOT status,
           updated_at = NOW()
       WHERE id=$1 AND vendor_id=$2
       RETURNING id, status, updated_at`,
      [id, vendor_id]
    );

    return success(res, "Product status updated successfully", updated.rows[0]);

  } catch (error) {
    console.error("Toggle Vendor Product Status Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  DELETE PRODUCT

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const deleted = await pool.query(
      `DELETE FROM vendor_schema.products
       WHERE id=$1 AND vendor_id=$2
       RETURNING *`,
      [id, vendor_id]
    );

    if (deleted.rows.length === 0)
      return failure(res, "Product not found", 404);

    return success(res, "Product deleted successfully", deleted.rows[0]);

  } catch (error) {
    console.error("Delete Vendor Product Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  BULK DELETE PRODUCTS

export const deleteMultipleProducts = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Please provide an array of product IDs");
    }

    // Convert to integers
    const productIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (productIds.length === 0) {
      return failure(res, "No valid product IDs provided");
    }

    const result = await pool.query(
      `DELETE FROM vendor_schema.products
       WHERE vendor_id = $1 AND id = ANY($2)
       RETURNING *`,
      [vendor_id, productIds]
    );

    return success(
      res,
      `${result.rowCount} product(s) deleted successfully`,
      { deletedCount: result.rowCount, deletedIds: productIds }
    );

  } catch (error) {
    console.error("Bulk Delete Vendor Products Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  GET PRODUCTS BY BRAND

export const getProductsByBrand = async (req, res) => {
  try {
    const { brand_id } = req.params;
    const vendor_id = req.vendor.id;

    const result = await pool.query(`
      SELECT
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM vendor_schema.products p
      JOIN vendor_schema.brands b ON p.brand_id = b.id
      JOIN vendor_schema.categories c ON p.category_id = c.id
      JOIN vendor_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.vendor_id = $1 AND p.brand_id = $2
      ORDER BY p.id DESC
    `, [vendor_id, brand_id]);

    return success(res, "Products fetched successfully", result.rows);

  } catch (error) {
    console.error("Get Vendor Products By Brand Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  GET PRODUCTS BY CATEGORY

export const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const vendor_id = req.vendor.id;

    const result = await pool.query(`
      SELECT
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM vendor_schema.products p
      JOIN vendor_schema.brands b ON p.brand_id = b.id
      JOIN vendor_schema.categories c ON p.category_id = c.id
      JOIN vendor_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.vendor_id = $1 AND p.category_id = $2
      ORDER BY p.id DESC
    `, [vendor_id, category_id]);

    return success(res, "Products fetched successfully", result.rows);

  } catch (error) {
    console.error("Get Vendor Products By Category Error:", error);
    return failure(res, "Server error", 500);
  }
};


  //  GET PRODUCTS BY SUBCATEGORY

export const getProductsBySubCategory = async (req, res) => {
  try {
    const { sub_category_id } = req.params;
    const vendor_id = req.vendor.id;

    const result = await pool.query(`
      SELECT
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM vendor_schema.products p
      JOIN vendor_schema.brands b ON p.brand_id = b.id
      JOIN vendor_schema.categories c ON p.category_id = c.id
      JOIN vendor_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.vendor_id = $1 AND p.sub_category_id = $2
      ORDER BY p.id DESC
    `, [vendor_id, sub_category_id]);

    return success(res, "Products fetched successfully", result.rows);

  } catch (error) {
    console.error("Get Vendor Products By SubCategory Error:", error);
    return failure(res, "Server error", 500);
  }
};
