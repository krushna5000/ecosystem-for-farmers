import pool from "../config/db.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.util.js";

// Helpers
const success = (res, message, data = null) =>
  res.status(200).json({ status: "success", message, data });

const failure = (res, message, code = 400) =>
  res.status(code).json({ status: "error", message });

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const company_id = req.company.id;

    const {
      brand_id,
      category_id,
      sub_category_id,
      product_name,
      description,
    } = req.body;

    /* ---------- SAFE JSON PARSING ---------- */
    let chemical_composition = [];
    let crop_ids = [];
    let disease_names = [];

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

      // Parse disease_names
      if (req.body.disease_names) {
        const parsed =
          typeof req.body.disease_names === "string"
            ? JSON.parse(req.body.disease_names)
            : req.body.disease_names;

        disease_names = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return failure(res, "Invalid JSON format");
    }

    /* ---------- Validation ---------- */
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
        "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required",
      );
    }

    /* ---------- Upload Image (Optional) ---------- */
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToS3({
        file: req.file,
        folder: "company/products",
      });
    }

    /* ---------- Validate Brand ---------- */
    const brand = await pool.query(
      `SELECT id FROM company_schema.brands 
       WHERE id=$1 AND company_id=$2`,
      [brand_id, company_id],
    );
    if (brand.rows.length === 0) return failure(res, "Invalid brand_id");

    /* ---------- Validate Category ---------- */
    const category = await pool.query(
      `SELECT id FROM company_schema.categories 
       WHERE id=$1 AND company_id=$2`,
      [category_id, company_id],
    );
    if (category.rows.length === 0) return failure(res, "Invalid category_id");

    /* ---------- Validate Sub-Category ---------- */
    const subcat = await pool.query(
      `SELECT id FROM company_schema.sub_categories 
       WHERE id=$1 AND company_id=$2`,
      [sub_category_id, company_id],
    );
    if (subcat.rows.length === 0)
      return failure(res, "Invalid sub_category_id");

    /* ---------- Duplicate Product Check ---------- */
    const exists = await pool.query(
      `SELECT id FROM company_schema.products
       WHERE LOWER(product_name) = LOWER($1)
       AND company_id = $2`,
      [product_name.trim(), company_id],
    );

    if (exists.rows.length > 0) return failure(res, "Product already exists");

    /* ---------- Insert Product ---------- */
    const result = await pool.query(
      `INSERT INTO company_schema.products
        (company_id, brand_id, category_id, sub_category_id,
         product_name, description, chemical_composition, crop_ids, disease_names, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        company_id,
        brand_id,
        category_id,
        sub_category_id,
        product_name.trim(),
        description || null,
        JSON.stringify(chemical_composition),
        crop_ids,
        disease_names,
        imageUrl,
      ],
    );

    return success(res, "Product created successfully", result.rows[0]);
  } catch (error) {
    console.error("Create Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

//GET ALL PRODUCTS (NON-PAGINATED FOR DROPDOWNS)
export const getAllProducts = async (req, res) => {
  try {
    const company_id = req.company.id;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.product_name,

        p.brand_id,
        p.category_id,
        p.sub_category_id,

        c.category_name,
        s.sub_category_name,

        p.chemical_composition,
        p.image,
        p.status

      FROM company_schema.products p

      LEFT JOIN company_schema.categories c
        ON p.category_id = c.id

      LEFT JOIN company_schema.sub_categories s
        ON p.sub_category_id = s.id

      WHERE p.company_id = $1

      ORDER BY p.product_name ASC
      `,
      [company_id],
    );

    return res.status(200).json({
      status: "success",

      message: "Products fetched successfully",

      data: result.rows,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    return failure(res, "Server error", 500);
  }
};

//GET ALL PRODUCTS (PAGINATED FOR TABLES)
export const getProductsTable = async (req, res) => {
  try {
    const company_id = req.company.id;

    const { page, limit, offset } = getPagination(req);

    // Total count
    const countResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM company_schema.products
      WHERE company_id = $1
      `,
      [company_id],
    );

    const totalItems = parseInt(countResult.rows[0].count);

    // Paginated data
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.company_id,
        p.brand_id,
        p.category_id,
        p.sub_category_id,
        p.product_name,
        b.brand_name,
        c.category_name,
        s.sub_category_name,
        p.description,
        p.chemical_composition,
        p.crop_ids,
        p.disease_names,
        p.image,
        p.status,
        p.created_at,
        p.updated_at

      FROM company_schema.products p

      JOIN company_schema.brands b
        ON p.brand_id = b.id

      JOIN company_schema.categories c
        ON p.category_id = c.id

      JOIN company_schema.sub_categories s
        ON p.sub_category_id = s.id

      WHERE p.company_id = $1

      ORDER BY p.id DESC

      LIMIT $2 OFFSET $3
      `,
      [company_id, limit, offset],
    );

    return res.status(200).json({
      status: "success",

      message: "Products fetched successfully",

      data: result.rows,

      pagination: getPaginationMeta({
        page,
        limit,
        totalItems,
      }),
    });
  } catch (error) {
    console.error("Get Products Table Error:", error);

    return failure(res, "Server error", 500);
  }
};

//   GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const result = await pool.query(
      `
      SELECT 
        p.*,
        b.brand_name,
        c.category_name,
        s.sub_category_name
      FROM company_schema.products p
      JOIN company_schema.brands b ON p.brand_id = b.id
      JOIN company_schema.categories c ON p.category_id = c.id
      JOIN company_schema.sub_categories s ON p.sub_category_id = s.id
      WHERE p.id=$1 AND p.company_id=$2
      `,
      [id, company_id],
    );

    if (result.rows.length === 0) return failure(res, "Product not found", 404);

    return success(res, "Product fetched successfully", result.rows[0]);
  } catch (error) {
    console.error(error);
    return failure(res, "Server error", 500);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    if (isNaN(id)) return failure(res, "Invalid product ID format", 400);

    const company_id = req.company.id;

    const {
      brand_id,
      category_id,
      sub_category_id,
      product_name,
      description,
    } = req.body;

    /* =============================
       SAFE JSON PARSING
    ============================== */

    let chemical_composition = null;
    let crop_ids = null;
    let disease_names = null;

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

    // 🔹 Parse disease_names
    if (req.body.disease_names) {
      try {
        const parsed =
          typeof req.body.disease_names === "string"
            ? JSON.parse(req.body.disease_names)
            : req.body.disease_names;

        disease_names = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        return failure(res, "disease_names must be valid JSON");
      }
    }

    /* =============================
       CHECK IF PRODUCT EXISTS
    ============================== */

    const exists = await pool.query(
      `SELECT id FROM company_schema.products
       WHERE id=$1 AND company_id=$2`,
      [id, company_id],
    );

    if (exists.rows.length === 0) return failure(res, "Product not found", 404);

    /* =============================
       IMAGE HANDLING
    ============================== */

    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToS3({
        file: req.file,
        folder: "company/products",
      });
    }

    /* =============================
       UPDATE QUERY
    ============================== */

    const updated = await pool.query(
      `UPDATE company_schema.products
       SET brand_id = COALESCE($1, brand_id),
           category_id = COALESCE($2, category_id),
           sub_category_id = COALESCE($3, sub_category_id),
           product_name = COALESCE($4, product_name),
           description = COALESCE($5, description),
           chemical_composition = COALESCE($6, chemical_composition),
           crop_ids = COALESCE($7, crop_ids),
           disease_names = COALESCE($8, disease_names),
           image = COALESCE($9, image),
           updated_at = NOW()
       WHERE id=$10 AND company_id=$11
       RETURNING *`,
      [
        brand_id || null,
        category_id || null,
        sub_category_id || null,
        product_name || null,
        description || null,
        chemical_composition ? JSON.stringify(chemical_composition) : null,
        crop_ids,
        disease_names,
        imageUrl,
        id,
        company_id,
      ],
    );

    return success(res, "Product updated successfully", updated.rows[0]);
  } catch (error) {
    console.error("Update Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

// TOGGLE PRODUCT STATUS
export const toggleProductStatus = async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (isNaN(id)) return failure(res, "Invalid product ID format", 400);

    const exists = await pool.query(
      `SELECT id FROM company_schema.products WHERE id=$1`,
      [id],
    );

    if (exists.rows.length === 0) return failure(res, "Product not found", 404);

    const updated = await pool.query(
      `
      UPDATE company_schema.products
      SET status = NOT status, updated_at = NOW()
      WHERE id = $1
      RETURNING id, status, updated_at
      `,
      [id],
    );

    return success(res, "Product status updated successfully", updated.rows[0]);
  } catch (error) {
    console.error("Toggle Product Status Error:", error);
    return failure(res, "Server error", 500);
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const deleted = await pool.query(
      `
      DELETE FROM company_schema.products
      WHERE id=$1 AND company_id=$2
      RETURNING *
      `,
      [id, company_id],
    );

    if (deleted.rows.length === 0)
      return failure(res, "Product not found", 404);

    return success(res, "Product deleted successfully", deleted.rows[0]);
  } catch (error) {
    console.error("Delete Product Error:", error);
    return failure(res, "Server error", 500);
  }
};

// BULK DELETE PRODUCTS
export const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of product IDs is required");
    }

    // Validate all IDs are numbers
    const invalidIds = ids.filter((id) => isNaN(id));
    if (invalidIds.length > 0) {
      return failure(res, "Invalid product ID format");
    }

    // Delete products and return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.products
       WHERE id = ANY($1) AND company_id = $2
       RETURNING *`,
      [ids, company_id],
    );

    if (deleted.rows.length === 0) {
      return failure(res, "No products found to delete", 404);
    }

    return success(
      res,
      `${deleted.rows.length} product(s) deleted successfully`,
      deleted.rows,
    );
  } catch (error) {
    console.error("Bulk Delete Products Error:", error);
    return failure(res, "Server error", 500);
  }
};

export const recommendationApi = async (req, res) => {
  try {
    const { cropName, diseaseName, chemicalComposition } = req.query;

    if (!cropName && !diseaseName && !chemicalComposition) {
      return res.status(400).json({
        message:
          "At least one of cropName, diseaseName or chemicalComposition is required",
        success: false,
      });
    }

    /* ======================================================
       RESOLVE cropName → cropId from farms_schema.crops
    ====================================================== */
    let cropIdNum = null;

    if (cropName) {
      // Try exact match first
      let cropResult = await pool.query(
        `SELECT id FROM farms_schema.crops
         WHERE LOWER(crop_name) = LOWER($1)
         LIMIT 1`,
        [cropName.trim()],
      );

      // Fallback: partial match (e.g. "Corn (Maize)" matches "Corn" or "Maize")
      if (cropResult.rows.length === 0) {
        cropResult = await pool.query(
          `SELECT id FROM farms_schema.crops
           WHERE LOWER($1) LIKE '%' || LOWER(crop_name) || '%'
              OR LOWER(crop_name) LIKE '%' || LOWER($1) || '%'
           LIMIT 1`,
          [cropName.trim()],
        );
      }

      if (cropResult.rows.length > 0) {
        cropIdNum = cropResult.rows[0].id;
      }
      // If crop not found in our DB, we still continue — other filters may match
    }

    /* ======================================================
       SHARED SELECT COLUMNS
    ====================================================== */
    const SELECT_COLS = `
        p.id,
        p.product_name,
        p.description,
        p.chemical_composition,
        p.crop_ids,
        p.disease_names,
        p.image,
        b.brand_name,
        c.category_name,
        s.sub_category_name`;

    const FROM_JOINS = `
      FROM company_schema.products p
      JOIN company_schema.brands b   ON p.brand_id = b.id
      JOIN company_schema.categories c ON p.category_id = c.id
      JOIN company_schema.sub_categories s ON p.sub_category_id = s.id`;

    /* ======================================================
       Priority 1 — EXACT MATCH
       crop matches  AND  disease_name matches  AND  chemical matches
    ====================================================== */
    let exactMatch = { rows: [] };

    if (cropIdNum && diseaseName && chemicalComposition) {
      exactMatch = await pool.query(
        `SELECT ${SELECT_COLS}, 'exact' AS match_type
         ${FROM_JOINS}
         WHERE p.status = true
           AND $1 = ANY(p.crop_ids)
           AND EXISTS (
             SELECT 1 FROM unnest(p.disease_names) d
             WHERE LOWER(d) = LOWER($2)
           )
           AND p.chemical_composition::text ILIKE $3
         ORDER BY p.created_at DESC
         LIMIT 5`,
        [cropIdNum, diseaseName.trim(), `%${chemicalComposition.trim()}%`],
      );
    }

    // Collect found IDs to exclude from next queries
    let excludeIds = exactMatch.rows.map((r) => r.id);

    /* ======================================================
       Priority 2 — DISEASE MATCH
       crop matches  AND  disease_name matches  (chemical may not)
    ====================================================== */
    let diseaseMatch = { rows: [] };
    const remaining2 = 5 - excludeIds.length;

    if (remaining2 > 0 && cropIdNum && diseaseName) {
      diseaseMatch = await pool.query(
        `SELECT ${SELECT_COLS}, 'disease' AS match_type
         ${FROM_JOINS}
         WHERE p.status = true
           AND $1 = ANY(p.crop_ids)
           AND EXISTS (
             SELECT 1 FROM unnest(p.disease_names) d
             WHERE LOWER(d) = LOWER($2)
           )
           AND p.id != ALL($3::int[])
         ORDER BY p.created_at DESC
         LIMIT $4`,
        [cropIdNum, diseaseName.trim(), excludeIds, remaining2],
      );
    }

    excludeIds = [...excludeIds, ...diseaseMatch.rows.map((r) => r.id)];

    /* ======================================================
       Priority 3 — CHEMICAL MATCH
       crop matches  AND  chemical matches  (disease may not)
    ====================================================== */
    let chemicalMatch = { rows: [] };
    const remaining3 = 5 - excludeIds.length;

    if (remaining3 > 0 && cropIdNum && chemicalComposition) {
      chemicalMatch = await pool.query(
        `SELECT ${SELECT_COLS}, 'chemical' AS match_type
         ${FROM_JOINS}
         WHERE p.status = true
           AND $1 = ANY(p.crop_ids)
           AND p.chemical_composition::text ILIKE $2
           AND p.id != ALL($3::int[])
         ORDER BY p.created_at DESC
         LIMIT $4`,
        [cropIdNum, `%${chemicalComposition.trim()}%`, excludeIds, remaining3],
      );
    }

    excludeIds = [...excludeIds, ...chemicalMatch.rows.map((r) => r.id)];

    /* ======================================================
       Priority 4 — CROP-ONLY MATCH  (fallback)
       Only the crop matches — fill remaining spots
    ====================================================== */
    let cropMatch = { rows: [] };
    const remaining4 = 5 - excludeIds.length;

    if (remaining4 > 0 && cropIdNum) {
      cropMatch = await pool.query(
        `SELECT ${SELECT_COLS}, 'crop' AS match_type
         ${FROM_JOINS}
         WHERE p.status = true
           AND $1 = ANY(p.crop_ids)
           AND p.id != ALL($2::int[])
         ORDER BY p.created_at DESC
         LIMIT $3`,
        [cropIdNum, excludeIds, remaining4],
      );
    }

    /* ======================================================
       Priority 5 — DISEASE + CHEMICAL ONLY (no crop match)
       Fallback when cropName wasn't found in our DB or no crop-based results
    ====================================================== */
    let fallbackMatch = { rows: [] };
    const remaining5 = 5 - excludeIds.length;

    if (remaining5 > 0 && diseaseName && chemicalComposition) {
      fallbackMatch = await pool.query(
        `SELECT ${SELECT_COLS}, 'fallback' AS match_type
         ${FROM_JOINS}
         WHERE p.status = true
           AND (
             EXISTS (
               SELECT 1 FROM unnest(p.disease_names) d
               WHERE LOWER(d) = LOWER($1)
             )
             OR p.chemical_composition::text ILIKE $2
           )
           AND p.id != ALL($3::int[])
         ORDER BY p.created_at DESC
         LIMIT $4`,
        [
          diseaseName.trim(),
          `%${chemicalComposition.trim()}%`,
          excludeIds,
          remaining5,
        ],
      );
    }

    /* ======================================================
       COMBINE & RESPOND
    ====================================================== */
    const allResults = [
      ...exactMatch.rows,
      ...diseaseMatch.rows,
      ...chemicalMatch.rows,
      ...cropMatch.rows,
      ...fallbackMatch.rows,
    ];

    return res.status(200).json({
      status: "success",
      message: `Found ${allResults.length} product(s)`,
      count: allResults.length,
      cropIdResolved: cropIdNum,
      breakdown: {
        exact_match: exactMatch.rows.length,
        disease_match: diseaseMatch.rows.length,
        chemical_match: chemicalMatch.rows.length,
        crop_match: cropMatch.rows.length,
        fallback_match: fallbackMatch.rows.length,
      },
      data: allResults,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);
    return res.status(500).json({
      message: "server-side error",
      success: false,
      error: error.message,
    });
  }
};
