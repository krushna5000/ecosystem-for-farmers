import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  deleteMultipleCategories,
} from "./category.controller.js";
import { authenticateVendor } from "../../../middleware/vendor/authenticateVendor.js";

const router = Router();

router.use(authenticateVendor);

// BULK DELETE categories (must be before /:id routes)
router.post("/bulk-delete", deleteMultipleCategories);
router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.patch("/status/:id", toggleCategoryStatus);
router.delete("/:id", deleteCategory);

export default router;
