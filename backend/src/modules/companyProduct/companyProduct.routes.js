import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { uploadProductImage } from "../../middleware/companyUploadProduct.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamsSchema,
  listQuerySchema,
  recommendationQuerySchema,
  createCompanyProductSchema,
  updateCompanyProductSchema,
  bulkDeleteSchema,
} from "./companyProduct.validator.js";
import * as companyProductController from "./companyProduct.controller.js";

// Mounted at /api/company-portal/company/products (routes/company.routes.js)
const router = Router();

router.use(responseStyle("status"));

// Public: recommended products for a crop / disease / chemical composition. Declared before the
// auth middleware (its path matches no other route, so the order is behaviour-neutral).
router.get(
  "/recommendation",
  validateQuery(recommendationQuerySchema),
  companyProductController.recommendationApi,
);

router.use(verifyCompanyToken);

// Specific paths before /:id
router.post("/bulk-delete", validate(bulkDeleteSchema), companyProductController.deleteCompanyProducts);
router.post(
  "/",
  uploadProductImage,
  validate(createCompanyProductSchema),
  companyProductController.createCompanyProduct,
);
router.get("/", companyProductController.getAllCompanyProducts);
router.get("/table", validateQuery(listQuerySchema), companyProductController.getCompanyProductsTable);
router.get("/:id", validateParams(idParamsSchema), companyProductController.getCompanyProductById);
router.put(
  "/:id",
  uploadProductImage,
  validateParams(idParamsSchema),
  validate(updateCompanyProductSchema),
  companyProductController.updateCompanyProduct,
);
router.patch(
  "/status/:id",
  validateParams(idParamsSchema),
  companyProductController.toggleCompanyProductStatus,
);
router.delete("/:id", validateParams(idParamsSchema), companyProductController.deleteCompanyProduct);

export default router;
