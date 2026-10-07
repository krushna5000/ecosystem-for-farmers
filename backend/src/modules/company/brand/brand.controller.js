import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { companyBrands } from "../../../db/schema/index.js";
import { uploadFile } from "../../../utils/storage.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { getPagination, getPaginationMeta } from "../../../utils/company/pagination.util.js";
import { statusSuccess as success, statusFailure as failure } from "../../../utils/company/response.js";
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
} from "../../../utils/company/helpers.js";

// CREATE BRAND
export const createBrand = async (req, res) => {
  try {
    const company_id = req.company.id;
    const brand_name = bodyOf(req).brand_name?.trim();

    //  Validation
    if (!brand_name) return failure(res, "Brand name is required");

    if (!req.file) return failure(res, "Brand logo is required");

    /* ---------- Duplicate Check (Case-Insensitive) ---------- */
    const [exists] = await db
      .select({ id: companyBrands.id })
      .from(companyBrands)
      .where(
        and(
          sql`LOWER(${companyBrands.brandName}) = LOWER(${brand_name})`,
          eq(companyBrands.companyId, company_id),
        ),
      );

    if (exists) return failure(res, "Brand already exists for this company");

    /* ---------- Upload Logo ---------- */
    const logoURL = await uploadFile({ file: req.file, folder: "company/brands" });

    /* ---------- Insert Brand ---------- */
    const [brand] = await db
      .insert(companyBrands)
      .values({ companyId: company_id, brandName: brand_name, logo: logoURL })
      .returning();

    return success(res, "Brand created successfully", snakeKeys(brand));
  } catch (error) {
    console.error("Create Brand Error:", error);
    return failure(res, "Failed to create brand", 500);
  }
};

//  GET ALL BRANDS
export const getAllBrands = async (req, res) => {
  try {
    const company_id = req.company.id;

    const brands = await db
      .select(pickCols(companyBrands, ["id", "brandName", "logo", "status"]))
      .from(companyBrands)
      .where(eq(companyBrands.companyId, company_id))
      .orderBy(asc(companyBrands.brandName));

    return res.status(200).json({
      status: "success",
      data: snakeRows(brands),
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

    const totalItems = await countOwned(companyBrands, company_id);

    const brands = await db
      .select(
        pickCols(companyBrands, [
          "id",
          "brandName",
          "logo",
          "status",
          "createdAt",
          "updatedAt",
        ]),
      )
      .from(companyBrands)
      .where(eq(companyBrands.companyId, company_id))
      .orderBy(desc(companyBrands.createdAt))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      status: "success",
      data: snakeRows(brands),

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

    const [brand] = await db
      .select(
        pickCols(companyBrands, [
          "id",
          "brandName",
          "logo",
          "status",
          "createdAt",
          "updatedAt",
        ]),
      )
      .from(companyBrands)
      .where(and(eq(companyBrands.id, id), eq(companyBrands.companyId, company_id)));

    if (!brand) return failure(res, "Brand not found", 404);

    return success(res, "Brand fetched successfully", snakeKeys(brand));
  } catch (error) {
    console.error("Get Brand By ID Error:", error);
    return failure(res, "Failed to fetch brand", 500);
  }
};

// UPDATE BRAND
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, status } = bodyOf(req);
    const company_id = req.company.id;

    /* ---------- Check Brand Exists ---------- */
    const exists = await findOwned(companyBrands, id, company_id);
    if (!exists) return failure(res, "Brand not found", 404);

    /* ---------- Upload New Logo (Optional) ---------- */
    let newLogoURL = null;
    if (req.file) {
      newLogoURL = await uploadFile({ file: req.file, folder: "company/brands" });
    }

    /* ---------- Update Brand (COALESCE semantics: only provided fields change) ---------- */
    const changes = { updatedAt: nowSql };
    if (brand_name != null) changes.brandName = brand_name;
    if (newLogoURL != null) changes.logo = newLogoURL;
    if (status != null) changes.status = toBool(status);

    const [updated] = await db
      .update(companyBrands)
      .set(changes)
      .where(and(eq(companyBrands.id, id), eq(companyBrands.companyId, company_id)))
      .returning();

    return success(res, "Brand updated successfully", snakeKeys(updated));
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

    const deleted = await removeOwned(companyBrands, id, company_id);

    if (!deleted) return failure(res, "Brand not found", 404);

    return success(res, "Brand deleted successfully", snakeKeys(deleted));
  } catch (error) {
    console.error("Delete Brand Error:", error);
    return failure(res, "Failed to delete brand", 500);
  }
};

// BULK DELETE BRANDS
export const deleteBrands = async (req, res) => {
  try {
    const { ids } = bodyOf(req);
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of brand IDs is required");
    }

    // Validate all IDs are numbers
    if (hasInvalidIds(ids)) {
      return failure(res, "Invalid brand ID format");
    }

    // Delete brands and return deleted data
    const deleted = await removeManyOwned(companyBrands, ids, company_id);

    if (deleted.length === 0) {
      return failure(res, "No brands found to delete", 404);
    }

    return success(
      res,
      `${deleted.length} brand(s) deleted successfully`,
      snakeRows(deleted),
    );
  } catch (error) {
    console.error("Bulk Delete Brands Error:", error);
    return failure(res, "Failed to delete brands", 500);
  }
};
