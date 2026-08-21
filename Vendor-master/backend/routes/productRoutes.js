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
  deleteMultipleProducts
} from "../controllers/productController.js";

import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { uploadProductImage } from "../middleware/multer.js";

const router = Router();


  //  AUTH MIDDLEWARE


router.use(authenticateVendor);


// BULK DELETE products (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleProducts);

// CREATE product
router.post("/", uploadProductImage, createProduct);

// GET all products
router.get("/", getAllProducts);

// FILTER products
router.get("/brand/:brand_id", getProductsByBrand);
router.get("/category/:category_id", getProductsByCategory);
router.get("/subcategory/:sub_category_id", getProductsBySubCategory);

// GET product by ID
router.get("/:id", getProductById);

// UPDATE product
router.put("/:id", uploadProductImage, updateProduct);

// TOGGLE product status
router.patch("/status/:id", toggleProductStatus);


// DELETE product
router.delete("/:id", deleteProduct);

export default router;
