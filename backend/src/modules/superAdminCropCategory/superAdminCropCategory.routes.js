import { Router } from "express";
import { authMiddleware } from "../../middleware/superAdminAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  bulkDeleteSchema,
} from "./superAdminCropCategory.validator.js";
import * as superAdminCropCategoryController from "./superAdminCropCategory.controller.js";

// Mounted at /api/super-admin/crop-categories (routes/superAdmin.routes.js). Auth is applied per route, as before.
const router = Router();

router.use(responseStyle("flag"));

router.post("/", authMiddleware, validate(createCategorySchema), superAdminCropCategoryController.createCategory);
router.get("/", authMiddleware, validateQuery(listQuerySchema), superAdminCropCategoryController.getAllCategories);
// Specific paths before /:id
router.delete(
  "/bulk-delete",
  authMiddleware,
  validate(bulkDeleteSchema),
  superAdminCropCategoryController.bulkDeleteCategories,
);
router.get("/:id", authMiddleware, validateParams(idParamSchema), superAdminCropCategoryController.getCategoryById);
router.put(
  "/:id",
  authMiddleware,
  validateParams(idParamSchema),
  validate(updateCategorySchema),
  superAdminCropCategoryController.updateCategory,
);
router.delete("/:id", authMiddleware, validateParams(idParamSchema), superAdminCropCategoryController.deleteCategory);

export default router;
