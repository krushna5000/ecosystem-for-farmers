import { Router } from "express";
import {
  createVendorBrand,
  getAllVendorBrands,
  getVendorBrandById,
  updateVendorBrand,
  deleteVendorBrand,
  deleteMultipleBrands
} from "../controllers/brandController.js";

import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { uploadBrandLogo } from "../middleware/multer.js";

const router = Router();

// Apply Vendor Authentication
router.use(authenticateVendor);

// BULK DELETE brands (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleBrands);

// CREATE brand
router.post("/", uploadBrandLogo, createVendorBrand);

// GET all brands (uses authenticated vendor from token)
router.get("/", getAllVendorBrands);

// GET brand by ID
router.get("/:id", getVendorBrandById);

// UPDATE brand
router.put("/:id", uploadBrandLogo, updateVendorBrand);

// DELETE brand
router.delete("/:id", deleteVendorBrand);

export default router;
