import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamsSchema,
  listQuerySchema,
  createCompanySubCategorySchema,
  updateCompanySubCategorySchema,
  bulkDeleteSchema,
} from "./companySubCategory.validator.js";
import * as companySubCategoryController from "./companySubCategory.controller.js";

// Mounted at /api/company-portal/company/subcategories (routes/company.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(verifyCompanyToken);

// Specific paths before /:id
router.post(
  "/bulk-delete",
  validate(bulkDeleteSchema),
  companySubCategoryController.deleteCompanySubCategories,
);
router.post(
  "/",
  validate(createCompanySubCategorySchema),
  companySubCategoryController.createCompanySubCategory,
);
router.get("/", companySubCategoryController.getAllCompanySubCategories);
router.get(
  "/table",
  validateQuery(listQuerySchema),
  companySubCategoryController.getCompanySubCategoriesTable,
);
router.get(
  "/:id",
  validateParams(idParamsSchema),
  companySubCategoryController.getCompanySubCategoryById,
);
router.put(
  "/:id",
  validateParams(idParamsSchema),
  validate(updateCompanySubCategorySchema),
  companySubCategoryController.updateCompanySubCategory,
);
router.patch(
  "/status/:id",
  validateParams(idParamsSchema),
  companySubCategoryController.toggleCompanySubCategoryStatus,
);
router.delete(
  "/:id",
  validateParams(idParamsSchema),
  companySubCategoryController.deleteCompanySubCategory,
);

export default router;
