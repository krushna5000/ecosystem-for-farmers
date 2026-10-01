import { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
  deleteMultipleSubCategories,
} from "../controllers/subCategoryController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";

const router = Router();

router.use(authenticateVendor);

// BULK DELETE sub-categories (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleSubCategories);
router.post("/", createSubCategory);
router.get("/", getAllSubCategories);
// GET /:id (getSubCategoryById) was commented out in the old routes and stays unrouted
router.put("/:id", updateSubCategory);
router.patch("/status/:id", toggleSubCategoryStatus);
router.delete("/:id", deleteSubCategory);

export default router;
