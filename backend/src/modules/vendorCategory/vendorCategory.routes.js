import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  createVendorCategorySchema,
  updateVendorCategorySchema,
  bulkDeleteSchema,
} from "./vendorCategory.validator.js";
import * as vendorCategoryController from "./vendorCategory.controller.js";

// Mounted at /api/vendor-portal/categories (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("flag"));
router.use(authenticateVendor);

// BULK DELETE categories (must be before /:id routes)
router.post("/bulk-delete", validate(bulkDeleteSchema), vendorCategoryController.deleteMultipleCategories);
router.post("/", validate(createVendorCategorySchema), vendorCategoryController.createCategory);
router.get("/", validateQuery(listQuerySchema), vendorCategoryController.getAllCategories);
router.get("/:id", validateParams(idParamSchema), vendorCategoryController.getCategoryById);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateVendorCategorySchema),
  vendorCategoryController.updateCategory,
);
router.patch("/status/:id", validateParams(idParamSchema), vendorCategoryController.toggleCategoryStatus);
router.delete("/:id", validateParams(idParamSchema), vendorCategoryController.deleteCategory);

export default router;
