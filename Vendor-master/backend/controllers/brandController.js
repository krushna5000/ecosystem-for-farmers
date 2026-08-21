import pool from "../config/db.js";
import { uploadToS3 } from "../config/s3.js";

// Helper Responses
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


  //  CREATE VENDOR BRAND

export const createVendorBrand = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const brand_name = req.body.brand_name?.trim();
    const status=req.body.status;

    if (!brand_name) {
      return failure(res, "Brand name is required");
    }

    if (!req.file) {
      return failure(res, "Brand logo is required");
    }

    // Case-insensitive duplicate check
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.brands
       WHERE LOWER(brand_name) = LOWER($1)
       AND vendor_id = $2`,
      [brand_name, vendor_id]
    );

    if (exists.rows.length > 0) {
      return failure(res, "Brand already exists for this vendor", 409);
    }

    // Upload logo to S3
    const logoURL = await uploadToS3(req.file, 'brands');

    const result = await pool.query(
      `INSERT INTO vendor_schema.brands (vendor_id, brand_name, logo,status)
       VALUES ($1, $2, $3,$4)
       RETURNING *`,
      [vendor_id, brand_name, logoURL,status]
    );

    return success(res, "Vendor brand created successfully", result.rows[0]);

  } catch (err) {
    console.error("Create Vendor Brand Error:", err);
    return failure(res, "Failed to create vendor brand", 500);
  }
};


  //  GET ALL VENDOR BRANDS - WITH PAGINATION

export const getAllVendorBrands = async (req, res) => {
  try {
    // Get vendor_id from authenticated vendor
    const vendor_id = req.vendor.id;
    
    // Pagination params with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vendor_schema.brands WHERE vendor_id = $1`,
      [vendor_id]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const brands = await pool.query(
      `SELECT *
       FROM vendor_schema.brands
       WHERE vendor_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [vendor_id, limit, offset]
    );

    return success(res, "Vendor brands fetched successfully", {
      data: brands.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch vendor brands");
  }
};


  //  GET VENDOR BRAND BY ID

export const getVendorBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a number
    if (isNaN(id)) {
      return failure(res, "Invalid brand ID format", 400);
    }
    
    const vendor_id = req.vendor.id;

    const brand = await pool.query(
      `SELECT *
       FROM vendor_schema.brands
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendor_id]
    );

    if (brand.rows.length === 0) {
      return failure(res, "Vendor brand not found", 404);
    }

    return success(res, "Vendor brand fetched successfully", brand.rows[0]);
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch vendor brand");
  }
};


  //  UPDATE VENDOR BRAND

export const updateVendorBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, status } = req.body;
    const vendor_id = req.vendor.id;

    const exists = await pool.query(
      `SELECT id FROM vendor_schema.brands
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendor_id]
    );

    if (exists.rows.length === 0) {
      return failure(res, "Vendor brand not found", 404);
    }

    let newLogo = null;

    if (req.file) {
      // Upload logo to S3
      newLogo = await uploadToS3(req.file, 'brands');
    }

    const updated = await pool.query(
      `UPDATE vendor_schema.brands
       SET brand_name = COALESCE($1, brand_name),
           logo = COALESCE($2, logo),
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND vendor_id = $5
       RETURNING *`,
      [brand_name, newLogo, status, id, vendor_id]
    );

    return success(res, "Vendor brand updated successfully", updated.rows[0]);

  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update vendor brand");
  }
};


  //  DELETE VENDOR BRAND

export const deleteVendorBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const deleted = await pool.query(
      `DELETE FROM vendor_schema.brands
       WHERE id = $1 AND vendor_id = $2
       RETURNING *`,
      [id, vendor_id]
    );

    if (deleted.rows.length === 0) {
      return failure(res, "Vendor brand not found", 404);
    }

    return success(res, "Vendor brand deleted successfully", deleted.rows[0]);

  } catch (err) {
    console.error(err);
    return failure(res, "Failed to delete vendor brand");
  }
};


  //  BULK DELETE VENDOR BRANDS

export const deleteMultipleBrands = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Please provide an array of brand IDs");
    }

    // Convert to integers
    const brandIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (brandIds.length === 0) {
      return failure(res, "No valid brand IDs provided");
    }

    const result = await pool.query(
      `DELETE FROM vendor_schema.brands
       WHERE vendor_id = $1 AND id = ANY($2)
       RETURNING *`,
      [vendor_id, brandIds]
    );

    return success(
      res,
      `${result.rowCount} brand(s) deleted successfully`,
      { deletedCount: result.rowCount, deletedIds: brandIds }
    );

  } catch (err) {
    console.error("Bulk Delete Vendor Brands Error:", err);
    return failure(res, "Failed to delete vendor brands");
  }
};
