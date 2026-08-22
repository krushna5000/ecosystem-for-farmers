import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteProducts,
  recommendationApi,
  getProductsTable,
} from "../controllers/productController.js";

import { verifyCompanyToken } from "../middleware/authMiddleware.js";
import { uploadProductImage } from "../middleware/uploadProduct.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteProducts);
router.post("/", verifyCompanyToken, uploadProductImage, createProduct);
// /api/company/products/
router.get("/", verifyCompanyToken, getAllProducts);
router.get("/table", verifyCompanyToken, getProductsTable);
// /api/company/products/recommendation ---> this will use to get the recommendation for the crop and disease
router.get("/recommendation", recommendationApi);
router.get("/:id", verifyCompanyToken, getProductById);
router.put("/:id", verifyCompanyToken, uploadProductImage, updateProduct);
router.patch("/status/:id", verifyCompanyToken, toggleProductStatus);
router.delete("/:id", verifyCompanyToken, deleteProduct);

export default router;
