import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { vendorBrands } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";
import { uploadFile } from "../../../lib/storage.js";
import { success, failure } from "../utils/response.js";
import {
  now,
  ciEq,
  toBoolean,
  parsePagination,
  paginationMeta,
  pageByVendor,
  parseIdList,
  bulkDeleteByVendor,
} from "../utils/helpers.js";

const LOGO_FOLDER = "vendor-brands";

const ownBrand = (id, vendorId) => and(eq(vendorBrands.id, id), eq(vendorBrands.vendorId, vendorId));

//  CREATE VENDOR BRAND
export const createVendorBrand = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const brand_name = req.body?.brand_name?.trim();
    const status = req.body?.status;

    if (!brand_name) {
      return failure(res, "Brand name is required");
    }

    if (!req.file) {
      return failure(res, "Brand logo is required");
    }

    // Case-insensitive duplicate check
    const [exists] = await db
      .select({ id: vendorBrands.id })
      .from(vendorBrands)
      .where(and(ciEq(vendorBrands.brandName, brand_name), eq(vendorBrands.vendorId, vendor_id)));

    if (exists) {
      return failure(res, "Brand already exists for this vendor", 409);
    }

    const logoURL = await uploadFile({ file: req.file, folder: LOGO_FOLDER });

    const [brand] = await db
      .insert(vendorBrands)
      .values({ vendorId: vendor_id, brandName: brand_name, logo: logoURL, status: toBoolean(status) })
      .returning();

    return success(res, "Vendor brand created successfully", snakeKeys(brand));
  } catch (err) {
    console.error("Create Vendor Brand Error:", err);
    return failure(res, "Failed to create vendor brand", 500);
  }
};

//  GET ALL VENDOR BRANDS - WITH PAGINATION
export const getAllVendorBrands = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const { page, limit, offset } = parsePagination(req.query);

    const { total, rows } = await pageByVendor(vendorBrands, vendor_id, desc(vendorBrands.createdAt), {
      limit,
      offset,
    });

    return success(res, "Vendor brands fetched successfully", {
      data: snakeRows(rows),
      pagination: paginationMeta(total, page, limit),
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

    if (isNaN(id)) {
      return failure(res, "Invalid brand ID format", 400);
    }

    const [brand] = await db.select().from(vendorBrands).where(ownBrand(id, req.vendor.id));

    if (!brand) {
      return failure(res, "Vendor brand not found", 404);
    }

    return success(res, "Vendor brand fetched successfully", snakeKeys(brand));
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to fetch vendor brand");
  }
};

//  UPDATE VENDOR BRAND
export const updateVendorBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name, status } = req.body ?? {};
    const vendor_id = req.vendor.id;

    const [exists] = await db
      .select({ id: vendorBrands.id })
      .from(vendorBrands)
      .where(ownBrand(id, vendor_id));

    if (!exists) {
      return failure(res, "Vendor brand not found", 404);
    }

    const changes = { updatedAt: now() };
    if (brand_name != null) changes.brandName = brand_name;
    if (req.file) changes.logo = await uploadFile({ file: req.file, folder: LOGO_FOLDER });
    if (status != null) changes.status = toBoolean(status);

    const [updated] = await db
      .update(vendorBrands)
      .set(changes)
      .where(ownBrand(id, vendor_id))
      .returning();

    return success(res, "Vendor brand updated successfully", snakeKeys(updated));
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to update vendor brand");
  }
};

//  DELETE VENDOR BRAND
export const deleteVendorBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db.delete(vendorBrands).where(ownBrand(id, req.vendor.id)).returning();

    if (!deleted) {
      return failure(res, "Vendor brand not found", 404);
    }

    return success(res, "Vendor brand deleted successfully", snakeKeys(deleted));
  } catch (err) {
    console.error(err);
    return failure(res, "Failed to delete vendor brand");
  }
};

//  BULK DELETE VENDOR BRANDS
export const deleteMultipleBrands = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;
    const brandIds = parseIdList(req.body?.ids);

    if (!brandIds) {
      return failure(res, "Please provide an array of brand IDs");
    }

    if (brandIds.length === 0) {
      return failure(res, "No valid brand IDs provided");
    }

    const deleted = await bulkDeleteByVendor(vendorBrands, vendor_id, brandIds);

    return success(res, `${deleted.length} brand(s) deleted successfully`, {
      deletedCount: deleted.length,
      deletedIds: brandIds,
    });
  } catch (err) {
    console.error("Bulk Delete Vendor Brands Error:", err);
    return failure(res, "Failed to delete vendor brands");
  }
};
