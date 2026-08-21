import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  deleteMultipleCategories
} from "../controllers/categoryController.js";

import { authenticateVendor } from "../middleware/authenticateVendor.js";

const router = Router();


//    Vendor Authentication

router.use(authenticateVendor);



// BULK DELETE categories (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleCategories);

// CREATE category
router.post("/", createCategory);

// GET all categories (with pagination)
router.get("/", getAllCategories);

// GET category by ID
router.get("/:id", getCategoryById);

// UPDATE category
router.put("/:id", updateCategory);

// TOGGLE category status
router.patch("/status/:id", toggleCategoryStatus);

// DELETE category
router.delete("/:id", deleteCategory);

export default router;
