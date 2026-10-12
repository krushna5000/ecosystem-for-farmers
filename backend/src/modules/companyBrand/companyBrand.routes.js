import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { uploadBrandImage } from "../../middleware/companyUploadBrandImage.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamsSchema,
  listQuerySchema,
  createCompanyBrandSchema,
  updateCompanyBrandSchema,
  bulkDeleteSchema,
} from "./companyBrand.validator.js";
import * as companyBrandController from "./companyBrand.controller.js";

// Mounted at /api/company-portal/company/brands (routes/company.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(verifyCompanyToken);

// Specific paths before /:id
router.post("/bulk-delete", validate(bulkDeleteSchema), companyBrandController.deleteCompanyBrands);
// Upload logo using multer
router.post(
  "/create",
  uploadBrandImage,
  validate(createCompanyBrandSchema),
  companyBrandController.createCompanyBrand,
);
router.put(
  "/:id",
  uploadBrandImage,
  validateParams(idParamsSchema),
  validate(updateCompanyBrandSchema),
  companyBrandController.updateCompanyBrand,
);

router.get("/", companyBrandController.getAllCompanyBrands);
router.get("/table", validateQuery(listQuerySchema), companyBrandController.getCompanyBrandsTable);
router.get("/:id", validateParams(idParamsSchema), companyBrandController.getCompanyBrandById);
router.delete("/:id", validateParams(idParamsSchema), companyBrandController.deleteCompanyBrand);

export default router;
