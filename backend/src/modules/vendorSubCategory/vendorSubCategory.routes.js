import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  createVendorSubCategorySchema,
  updateVendorSubCategorySchema,
  bulkDeleteSchema,
} from "./vendorSubCategory.validator.js";
import * as vendorSubCategoryController from "./vendorSubCategory.controller.js";

// Mounted at /api/vendor-portal/subcategories (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(authenticateVendor);

// BULK DELETE sub-categories (must be before /:id routes)
router.post("/bulk-delete", validate(bulkDeleteSchema), vendorSubCategoryController.deleteMultipleSubCategories);
router.post("/", validate(createVendorSubCategorySchema), vendorSubCategoryController.createSubCategory);
router.get("/", validateQuery(listQuerySchema), vendorSubCategoryController.getAllSubCategories);
// GET /:id was commented out in the old routes and stays unrouted
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateVendorSubCategorySchema),
  vendorSubCategoryController.updateSubCategory,
);
router.patch("/status/:id", validateParams(idParamSchema), vendorSubCategoryController.toggleSubCategoryStatus);
router.delete("/:id", validateParams(idParamSchema), vendorSubCategoryController.deleteSubCategory);

export default router;
