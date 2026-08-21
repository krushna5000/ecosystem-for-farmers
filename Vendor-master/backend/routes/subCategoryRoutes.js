import { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
  deleteMultipleSubCategories
} from "../controllers/subCategoryController.js";

import { authenticateVendor } from "../middleware/authenticateVendor.js";

const router = Router();



router.use(authenticateVendor);

// BULK DELETE sub-categories (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleSubCategories);

// CREATE sub-category
router.post("/", createSubCategory);

router.get("/", getAllSubCategories);

// router.get("/:id", getSubCategoryById);

router.put("/:id", updateSubCategory);


router.patch("/status/:id", toggleSubCategoryStatus);

router.delete("/:id", deleteSubCategory);

export default router;
