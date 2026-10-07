import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandsTable,
  getBrandById,
  updateBrand,
  deleteBrand,
  deleteBrands,
} from "./brand.controller.js";

import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";
import { uploadBrandImage } from "../../../middleware/company/uploadBrandImage.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteBrands);
// Upload logo using multer
router.post("/create", verifyCompanyToken, uploadBrandImage, createBrand);
router.put("/:id", verifyCompanyToken, uploadBrandImage, updateBrand);

router.get("/", verifyCompanyToken, getAllBrands);
router.get("/table", verifyCompanyToken, getBrandsTable);
router.get("/:id", verifyCompanyToken, getBrandById);
router.delete("/:id", verifyCompanyToken, deleteBrand);

export default router;
