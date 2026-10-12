import { Router } from "express";
import { authMiddleware } from "../../middleware/superAdminAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  strictIdParamSchema,
  listQuerySchema,
  createCropStageSchema,
  updateCropStageSchema,
  bulkDeleteSchema,
} from "./superAdminCropStage.validator.js";
import * as superAdminCropStageController from "./superAdminCropStage.controller.js";

// Mounted at /api/super-admin/crop-stages (routes/superAdmin.routes.js). Auth is applied per route, as before.
const router = Router();

router.use(responseStyle("flag"));

router.post("/", authMiddleware, validate(createCropStageSchema), superAdminCropStageController.createCropStage);
router.get("/", authMiddleware, validateQuery(listQuerySchema), superAdminCropStageController.getAllCropStages);
// Specific paths before /:id
router.delete(
  "/bulk-delete",
  authMiddleware,
  validate(bulkDeleteSchema),
  superAdminCropStageController.bulkDeleteCropStages,
);
router.get("/:id", authMiddleware, validateParams(idParamSchema), superAdminCropStageController.getCropStageById);
router.put(
  "/:id",
  authMiddleware,
  validateParams(idParamSchema),
  validate(updateCropStageSchema),
  superAdminCropStageController.updateCropStage,
);
router.delete(
  "/:id",
  authMiddleware,
  validateParams(strictIdParamSchema),
  superAdminCropStageController.deleteCropStage,
);

export default router;
