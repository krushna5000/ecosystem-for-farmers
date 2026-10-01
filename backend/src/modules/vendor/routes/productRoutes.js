import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductsByBrand,
  getProductsByCategory,
  getProductsBySubCategory,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  deleteMultipleProducts,
} from "../controllers/productController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { uploadProductImage } from "../middleware/multer.js";

const router = Router();

router.use(authenticateVendor);

// BULK DELETE products (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleProducts);
router.post("/", uploadProductImage, createProduct);
router.get("/", getAllProducts);

// FILTER products
router.get("/brand/:brand_id", getProductsByBrand);
router.get("/category/:category_id", getProductsByCategory);
router.get("/subcategory/:sub_category_id", getProductsBySubCategory);

router.get("/:id", getProductById);
router.put("/:id", uploadProductImage, updateProduct);
router.patch("/status/:id", toggleProductStatus);
router.delete("/:id", deleteProduct);

export default router;
