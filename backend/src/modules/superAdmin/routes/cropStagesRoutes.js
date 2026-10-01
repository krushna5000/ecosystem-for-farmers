import express from "express";
import {
  createCropStage,
  getAllCropStages,
  getCropStageById,
  updateCropStage,
  deleteCropStage,
  bulkDeleteCropStages,
} from "../controllers/cropStagesController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createCropStage);
router.get("/", authMiddleware, getAllCropStages);
// must be BEFORE /:id routes
router.delete("/bulk-delete", authMiddleware, bulkDeleteCropStages);
router.get("/:id", authMiddleware, getCropStageById);
router.put("/:id", authMiddleware, updateCropStage);
router.delete("/:id", authMiddleware, deleteCropStage);

export default router;
