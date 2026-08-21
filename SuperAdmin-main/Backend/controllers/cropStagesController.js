import {
  createCropStage as createCropStageModel,
  getAllCropStages as getAllCropStagesModel,
  getCropStageById as getCropStageByIdModel,
  updateCropStageById as updateCropStageByIdModel,
  deleteCropStageById as deleteCropStageByIdModel,
  bulkDeleteCropStages as bulkDeleteCropStagesModel
} from '../models/cropStagesModel.js';

/**
 * Create a new crop stage
 * @param {Object} req 
 * @param {Object} res 
 */
export const createCropStage = async (req, res) => {
  try {
    const { stage_name, description } = req.body;

    // Validate required fields
    if (!stage_name) {
      return res.status(400).json({
        success: false,
        message: 'Stage name is required'
      });
    }

    // Check if crop stage name already exists
    const existingStages = await getAllCropStagesModel();
    const stageExists = existingStages.some(stage => stage.stage_name.toLowerCase() === stage_name.toLowerCase());
    if (stageExists) {
      return res.status(409).json({
        success: false,
        message: 'Crop stage already exists'
      });
    }

    const stage = await createCropStageModel(stage_name, description);

    res.status(201).json({
      success: true,
      message: 'Crop stage created successfully',
      data: stage
    });
  } catch (error) {
    console.error('Error creating crop stage:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Stage name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all crop stages with pagination
 * @param {Object} req 
 * @param {Object} res 
 */
export const getAllCropStages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await getAllCropStagesModel(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.status(200).json({
      success: true,
      message: 'Crop stages retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error retrieving crop stages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a crop stage by ID
 * @param {Object} req 
 * @param {Object} res 
 */
export const getCropStageById = async (req, res) => {
  try {
    const { id } = req.params;
    const stageId = parseInt(id, 10);

    if (isNaN(stageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage ID'
      });
    }

    const stage = await getCropStageByIdModel(stageId);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Crop stage not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop stage retrieved successfully',
      data: stage
    });
  } catch (error) {
    console.error('Error retrieving crop stage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update a crop stage
 * @param {Object} req 
 * @param {Object} res 
 */
export const updateCropStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_name, description } = req.body;
    const stageId = parseInt(id, 10);

    if (isNaN(stageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage ID'
      });
    }

    if (!stage_name) {
      return res.status(400).json({
        success: false,
        message: 'Stage name is required'
      });
    }

    const stage = await updateCropStageByIdModel(stageId, stage_name, description);

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Crop stage not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop stage updated successfully',
      data: stage
    });
  } catch (error) {
    console.error('Error updating crop stage:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Stage name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a crop stage
 * @param {Object} req 
 * @param {Object} res 
 */
export const deleteCropStage = async (req, res) => {
  try {
    const stageId = Number(req.params.id);

    if (!Number.isInteger(stageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stage ID",
      });
    }

    const deletedCount = await deleteCropStageByIdModel(stageId);

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Crop stage not found",
      });
    }

    // ✅ Do NOT send deleted stage data
    return res.status(200).json({
      success: true,
      message: "Crop stage deleted permanently",
    });

  } catch (error) {
    console.error("Error deleting crop stage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Bulk delete crop stages
 * @param {Object} req 
 * @param {Object} res 
 */
export const bulkDeleteCropStages = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stage IDs",
      });
    }

    const result = await bulkDeleteCropStagesModel(ids);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No crop stages found with provided IDs",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Crop stages deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
    });

  } catch (error) {
    console.error("Error bulk deleting crop stages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

