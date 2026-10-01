import * as cropsModel from "../models/cropsModel.js";
import { errorMessage } from "../utils/dbError.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

const fail = (res, status, message, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

const isBadId = (id) => !id || isNaN(id);

export const addCrop = async (req, res) => {
  try {
    const { category_id, crop_name, crop_stages_id, t_base } = req.body || {};

    if (!category_id || !crop_name) {
      return fail(res, 400, "Required fields are missing", {
        error: " category_id & crop_name are required",
      });
    }

    if (crop_stages_id && !Array.isArray(crop_stages_id)) {
      return fail(res, 400, "Invalid crop_stages_id", {
        error: "crop_stages_id must be an array",
      });
    }

    if (!(await cropsModel.categoryExists(category_id))) {
      return fail(res, 404, "Invalid category_id");
    }

    const crop = await cropsModel.createCrop({ category_id, crop_name, crop_stages_id, t_base });

    return res.status(201).json({
      success: true,
      message: "Crop added successfully",
      data: crop,
    });
  } catch (err) {
    console.error("AddCrop Error:", err);
    return fail(res, 500, "Failed to add crop", { error: errorMessage(err) });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (isBadId(id)) return fail(res, 400, "Invalid crop id");

    if (!(await cropsModel.cropExists(id))) return fail(res, 404, "Crop not found");

    const crop = await cropsModel.updateCrop(id, req.body || {});

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      data: crop,
    });
  } catch (err) {
    console.error("updateCrop Error:", err.message);
    return fail(res, 500, "Failed to update crop", { error: errorMessage(err) });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    if (isBadId(id)) return fail(res, 400, "Invalid crop id");

    if (!(await cropsModel.cropExists(id))) return fail(res, 404, "Crop not found");

    await cropsModel.deleteCrop(id);

    return res.status(200).json({ success: true, message: "Crop deleted successfully" });
  } catch (err) {
    console.error("DeleteCrop Error:", err);
    return fail(res, 500, "Failed to delete crop", { error: errorMessage(err) });
  }
};

export const getAllCrops = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const { rows, total } = await cropsModel.getAllCrops(page, limit);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: buildPagination(page, limit, total),
    });
  } catch (err) {
    console.error("getAllCrops:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
      error: errorMessage(err),
    });
  }
};

export const bulkDeleteCrops = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return fail(res, 400, "Invalid crop IDs");
    }

    const existing = await cropsModel.findExistingCropIds(ids);
    if (existing.length === 0) return fail(res, 404, "No crops found with provided IDs");

    const deletedIds = await cropsModel.bulkDeleteCrops(ids);

    return res.status(200).json({
      success: true,
      message: "Crops deleted successfully",
      deletedCount: deletedIds.length,
      deletedIds,
    });
  } catch (err) {
    console.error("BulkDeleteCrops Error:", err);
    return fail(res, 500, "Failed to delete crops", { error: errorMessage(err) });
  }
};
