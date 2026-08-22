import pool from "../config/db.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.util.js";

// Helpers
const success = (res, message, data = null) =>
  res.status(200).json({ status: "success", message, data });

const failure = (res, message, code = 400) =>
  res.status(code).json({ status: "error", message });

// CREATE BRAND
export const createBrand = async (req, res) => {
  try {
    const company_id = req.company.id;
    const brand_name = req.body.brand_name?.trim();

    //  Validation
    if (!brand_name) return failure(res, "Brand name is required");

    if (!req.file) return failure(res, "Brand logo is required");

    /* ---------- Duplicate Check (Case-Insensitive) ---------- */
    const exists = await pool.query(
      `SELECT id
       FROM company_schema.brands
       WHERE LOWER(brand_name) = LOWER($1)
       AND company_id = $2`,
      [brand_name, company_id],
    );

    if (exists.rows.length > 0)
      return failure(res, "Brand already exists for this company");

    /* ---------- Upload Logo to S3 ---------- */
    const logoURL = await uploadToS3({
      file: req.file,
      folder: "company/brands",
    });

    /* ---------- Insert Brand ---------- */
    const result = await pool.query(
      `INSERT INTO company_schema.brands
       (company_id, brand_name, logo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [company_id, brand_name, logoURL],
    );

    return success(res, "Brand created successfully", result.rows[0]);
  } catch (error) {
    console.error("Create Brand Error:", error);
    return failure(res, "Failed to create brand", 500);
  }
};

//  GET ALL BRANDS
export const getAllBrands = async (req, res) => {
  try {
    const company_id = req.company.id;

    const brands = await pool.query(
      `SELECT
          id,
          brand_name,
          logo,
          status
       FROM company_schema.brands
       WHERE company_id = $1
       ORDER BY brand_name ASC`,
      [company_id],
    );

    return res.status(200).json({
      status: "success",
      data: brands.rows,
    });
  } catch (error) {
    console.error(error);

    return failure(res, "Failed to fetch brands", 500);
  }
};

//Get brands data for tables (paginated)

export const getBrandsTable = async (req, res) => {
  try {
    const company_id = req.company.id;

    const { page, limit, offset } = getPagination(req);

    const countResult = await pool.query(
      `SELECT COUNT(*)
       FROM company_schema.brands
       WHERE company_id = $1`,
      [company_id],
    );

    const totalItems = parseInt(countResult.rows[0].count);

    const brands = await pool.query(
      `SELECT
          id,
          brand_name,
          logo,
          status,
          created_at,
          updated_at
       FROM company_schema.brands
       WHERE company_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [company_id, limit, offset],
    );

    return res.status(200).json({
      status: "success",
      data: brands.rows,

      pagination: getPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    });
  } catch (error) {
    console.error(error);

    return failure(res, "Failed to fetch brands", 500);
  }
};

//   GET BRAND BY ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const brand = await pool.query(
      `SELECT
         id,
         brand_name,
         logo,
         status,
         created_at,
         updated_at
       FROM company_schema.brands
       WHERE id = $1 AND company_id = $2`,
      [id, company_id],
    );

    if (brand.rows.length === 0) return failure(res, "Brand not found", 404);

    return success(res, "Brand fetched successfully", brand.rows[0]);
  } catch (error) {
    console.error("Get Brand By ID Error:", error);
    return failure(res, "Failed to fetch brand", 500);
  }
};

// UPDATE BRAND
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, status } = req.body;
    const company_id = req.company.id;

    /* ---------- Check Brand Exists ---------- */
    const exists = await pool.query(
      `SELECT id
       FROM company_schema.brands
       WHERE id = $1 AND company_id = $2`,
      [id, company_id],
    );

    if (exists.rows.length === 0) return failure(res, "Brand not found", 404);

    /* ---------- Upload New Logo (Optional) ---------- */
    let newLogoURL = null;
    if (req.file) {
      newLogoURL = await uploadToS3({
        file: req.file,
        folder: "company/brands",
      });
    }

    /* ---------- Update Brand ---------- */
    const updated = await pool.query(
      `UPDATE company_schema.brands
       SET brand_name = COALESCE($1, brand_name),
           logo       = COALESCE($2, logo),
           status     = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [brand_name, newLogoURL, status, id, company_id],
    );

    return success(res, "Brand updated successfully", updated.rows[0]);
  } catch (error) {
    console.error("Update Brand Error:", error);
    return failure(res, "Failed to update brand", 500);
  }
};

// DELETE BRAND
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const deleted = await pool.query(
      `DELETE FROM company_schema.brands
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, company_id],
    );

    if (deleted.rows.length === 0) return failure(res, "Brand not found", 404);

    return success(res, "Brand deleted successfully", deleted.rows[0]);
  } catch (error) {
    console.error("Delete Brand Error:", error);
    return failure(res, "Failed to delete brand", 500);
  }
};

// BULK DELETE BRANDS
export const deleteBrands = async (req, res) => {
  try {
    const { ids } = req.body;
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of brand IDs is required");
    }

    // Validate all IDs are numbers
    const invalidIds = ids.filter((id) => isNaN(id));
    if (invalidIds.length > 0) {
      return failure(res, "Invalid brand ID format");
    }

    // Delete brands and return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.brands
       WHERE id = ANY($1) AND company_id = $2
       RETURNING *`,
      [ids, company_id],
    );

    if (deleted.rows.length === 0) {
      return failure(res, "No brands found to delete", 404);
    }

    return success(
      res,
      `${deleted.rows.length} brand(s) deleted successfully`,
      deleted.rows,
    );
  } catch (error) {
    console.error("Bulk Delete Brands Error:", error);
    return failure(res, "Failed to delete brands", 500);
  }
};
