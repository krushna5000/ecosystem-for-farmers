import { Router } from "express";
import {
  createVendorBrand,
  getAllVendorBrands,
  getVendorBrandById,
  updateVendorBrand,
  deleteVendorBrand,
  deleteMultipleBrands,
} from "./brand.controller.js";
import { authenticateVendor } from "../../../middleware/vendor/authenticateVendor.js";
import { uploadBrandLogo } from "../../../middleware/vendor/multer.js";

const router = Router();

router.use(authenticateVendor);

// BULK DELETE brands (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleBrands);
router.post("/", uploadBrandLogo, createVendorBrand);
router.get("/", getAllVendorBrands);
router.get("/:id", getVendorBrandById);
router.put("/:id", uploadBrandLogo, updateVendorBrand);
router.delete("/:id", deleteVendorBrand);

export default router;
