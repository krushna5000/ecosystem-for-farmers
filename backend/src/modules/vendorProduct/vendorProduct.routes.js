import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { uploadProductImage } from "../../middleware/vendorMulter.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  brandIdParamSchema,
  categoryIdParamSchema,
  subCategoryIdParamSchema,
  listQuerySchema,
  createVendorProductSchema,
  updateVendorProductSchema,
  bulkDeleteSchema,
} from "./vendorProduct.validator.js";
import * as vendorProductController from "./vendorProduct.controller.js";

// Mounted at /api/vendor-portal/products (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(authenticateVendor);

// BULK DELETE products (must be before /:id routes)
router.post("/bulk-delete", validate(bulkDeleteSchema), vendorProductController.deleteMultipleProducts);
router.post("/", uploadProductImage, validate(createVendorProductSchema), vendorProductController.createProduct);
router.get("/", validateQuery(listQuerySchema), vendorProductController.getAllProducts);

// FILTER products
router.get("/brand/:brand_id", validateParams(brandIdParamSchema), vendorProductController.getProductsByBrand);
router.get(
  "/category/:category_id",
  validateParams(categoryIdParamSchema),
  vendorProductController.getProductsByCategory,
);
router.get(
  "/subcategory/:sub_category_id",
  validateParams(subCategoryIdParamSchema),
  vendorProductController.getProductsBySubCategory,
);

router.get("/:id", validateParams(idParamSchema), vendorProductController.getProductById);
router.put(
  "/:id",
  uploadProductImage,
  validateParams(idParamSchema),
  validate(updateVendorProductSchema),
  vendorProductController.updateProduct,
);
router.patch("/status/:id", validateParams(idParamSchema), vendorProductController.toggleProductStatus);
router.delete("/:id", validateParams(idParamSchema), vendorProductController.deleteProduct);

export default router;
