import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamsSchema,
  listQuerySchema,
  createCompanyCategorySchema,
  updateCompanyCategorySchema,
  bulkDeleteSchema,
} from "./companyCategory.validator.js";
import * as companyCategoryController from "./companyCategory.controller.js";

// Mounted at /api/company-portal/company/categories (routes/company.routes.js)
const router = Router();

router.use(responseStyle("flag"));
router.use(verifyCompanyToken);

// Specific paths before /:id
router.post(
  "/bulk-delete",
  validate(bulkDeleteSchema),
  companyCategoryController.deleteCompanyCategories,
);

router.post(
  "/create",
  validate(createCompanyCategorySchema),
  companyCategoryController.createCompanyCategory,
);
router.get("/", companyCategoryController.getAllCompanyCategories);
router.get("/table", validateQuery(listQuerySchema), companyCategoryController.getCompanyCategoriesTable);
router.get("/:id", validateParams(idParamsSchema), companyCategoryController.getCompanyCategoryById);
router.put(
  "/:id",
  validateParams(idParamsSchema),
  validate(updateCompanyCategorySchema),
  companyCategoryController.updateCompanyCategory,
);
router.patch(
  "/status/:id",
  validateParams(idParamsSchema),
  companyCategoryController.toggleCompanyCategoryStatus,
);
router.delete("/:id", validateParams(idParamsSchema), companyCategoryController.deleteCompanyCategory);

export default router;
