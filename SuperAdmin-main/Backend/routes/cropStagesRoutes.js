import express from 'express';
import {
  createCropStage,
  getAllCropStages,
  getCropStageById,
  updateCropStage,
  deleteCropStage,
  bulkDeleteCropStages
} from '../controllers/cropStagesController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a new crop stage
router.post('/', authMiddleware, createCropStage);

// Get all crop stages
router.get('/', authMiddleware, getAllCropStages);

// Bulk delete crop stages (must be BEFORE /:id routes)
router.delete('/bulk-delete', authMiddleware, bulkDeleteCropStages);

// Get crop stage by ID
router.get('/:id', authMiddleware, getCropStageById);

// Update crop stage by ID
router.put('/:id', authMiddleware, updateCropStage);

// Delete crop stage by ID
router.delete('/:id', authMiddleware, deleteCropStage);

export default router;
