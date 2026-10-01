import {
  createCropStage as createCropStageModel,
  getCropStageByName as getCropStageByNameModel,
  getAllCropStages as getAllCropStagesModel,
  getCropStageById as getCropStageByIdModel,
  updateCropStageById as updateCropStageByIdModel,
  deleteCropStageById as deleteCropStageByIdModel,
  bulkDeleteCropStages as bulkDeleteCropStagesModel,
} from "../models/cropStagesModel.js";
import { isUniqueViolation } from "../utils/dbError.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const serverError = (res) => fail(res, 500, "Internal server error");

export const createCropStage = async (req, res) => {
  try {
    const { stage_name, description } = req.body || {};

    if (!stage_name) return fail(res, 400, "Stage name is required");

    if (await getCropStageByNameModel(stage_name)) {
      return fail(res, 409, "Crop stage already exists");
    }

    const stage = await createCropStageModel(stage_name, description);

    res.status(201).json({
      success: true,
      message: "Crop stage created successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Error creating crop stage:", error);
    if (isUniqueViolation(error)) return fail(res, 409, "Stage name already exists");
    serverError(res);
  }
};

export const getAllCropStages = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await getAllCropStagesModel(page, limit);

    res.status(200).json({
      success: true,
      message: "Crop stages retrieved successfully",
      data: result.data,
      pagination: buildPagination(page, limit, result.total),
    });
  } catch (error) {
    console.error("Error retrieving crop stages:", error);
    serverError(res);
  }
};

export const getCropStageById = async (req, res) => {
  try {
    const stageId = parseInt(req.params.id, 10);
    if (isNaN(stageId)) return fail(res, 400, "Invalid stage ID");

    const stage = await getCropStageByIdModel(stageId);
    if (!stage) return fail(res, 404, "Crop stage not found");

    res.status(200).json({
      success: true,
      message: "Crop stage retrieved successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Error retrieving crop stage:", error);
    serverError(res);
  }
};

export const updateCropStage = async (req, res) => {
  try {
    const { stage_name, description } = req.body || {};
    const stageId = parseInt(req.params.id, 10);

    if (isNaN(stageId)) return fail(res, 400, "Invalid stage ID");
    if (!stage_name) return fail(res, 400, "Stage name is required");

    const stage = await updateCropStageByIdModel(stageId, stage_name, description);
    if (!stage) return fail(res, 404, "Crop stage not found");

    res.status(200).json({
      success: true,
      message: "Crop stage updated successfully",
      data: stage,
    });
  } catch (error) {
    console.error("Error updating crop stage:", error);
    if (isUniqueViolation(error)) return fail(res, 409, "Stage name already exists");
    serverError(res);
  }
};

export const deleteCropStage = async (req, res) => {
  try {
    const stageId = Number(req.params.id);
    if (!Number.isInteger(stageId)) return fail(res, 400, "Invalid stage ID");

    const deletedCount = await deleteCropStageByIdModel(stageId);
    if (deletedCount === 0) return fail(res, 404, "Crop stage not found");

    return res.status(200).json({
      success: true,
      message: "Crop stage deleted permanently",
    });
  } catch (error) {
    console.error("Error deleting crop stage:", error);
    return serverError(res);
  }
};

export const bulkDeleteCropStages = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return fail(res, 400, "Invalid stage IDs");
    }

    const result = await bulkDeleteCropStagesModel(ids);
    if (result.deletedCount === 0) {
      return fail(res, 404, "No crop stages found with provided IDs");
    }

    return res.status(200).json({
      success: true,
      message: "Crop stages deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
    });
  } catch (error) {
    console.error("Error bulk deleting crop stages:", error);
    return serverError(res);
  }
};
