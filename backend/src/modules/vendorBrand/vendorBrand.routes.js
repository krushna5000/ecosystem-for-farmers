import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { uploadBrandLogo } from "../../middleware/vendorMulter.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  createVendorBrandSchema,
  updateVendorBrandSchema,
  bulkDeleteSchema,
} from "./vendorBrand.validator.js";
import * as vendorBrandController from "./vendorBrand.controller.js";

// Mounted at /api/vendor-portal/brands (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(authenticateVendor);

// Specific paths before /:id
router.post("/bulk-delete", validate(bulkDeleteSchema), vendorBrandController.deleteMultipleBrands);

router.post("/", uploadBrandLogo, validate(createVendorBrandSchema), vendorBrandController.createVendorBrand);
router.get("/", validateQuery(listQuerySchema), vendorBrandController.getAllVendorBrands);
router.get("/:id", validateParams(idParamSchema), vendorBrandController.getVendorBrandById);
router.put(
  "/:id",
  uploadBrandLogo,
  validateParams(idParamSchema),
  validate(updateVendorBrandSchema),
  vendorBrandController.updateVendorBrand,
);
router.delete("/:id", validateParams(idParamSchema), vendorBrandController.deleteVendorBrand);

export default router;
