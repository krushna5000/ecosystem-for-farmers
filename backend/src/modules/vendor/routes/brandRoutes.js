import { Router } from "express";
import {
  createVendorBrand,
  getAllVendorBrands,
  getVendorBrandById,
  updateVendorBrand,
  deleteVendorBrand,
  deleteMultipleBrands,
} from "../controllers/brandController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { uploadBrandLogo } from "../middleware/multer.js";

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
