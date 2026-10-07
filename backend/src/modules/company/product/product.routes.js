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
} from "./product.controller.js";

import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";
import { uploadProductImage } from "../../../middleware/company/uploadProduct.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteProducts);
router.post("/", verifyCompanyToken, uploadProductImage, createProduct);
router.get("/", verifyCompanyToken, getAllProducts);
router.get("/table", verifyCompanyToken, getProductsTable);
// Public: recommended products for a crop / disease / chemical composition
router.get("/recommendation", recommendationApi);
router.get("/:id", verifyCompanyToken, getProductById);
router.put("/:id", verifyCompanyToken, uploadProductImage, updateProduct);
router.patch("/status/:id", verifyCompanyToken, toggleProductStatus);
router.delete("/:id", verifyCompanyToken, deleteProduct);

export default router;
