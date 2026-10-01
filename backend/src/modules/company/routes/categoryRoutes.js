import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoriesTable,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  deleteCategories,
} from "../controllers/categoryController.js";

import { verifyCompanyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteCategories);

router.post("/create", verifyCompanyToken, createCategory);
router.get("/", verifyCompanyToken, getAllCategories);
router.get("/table", verifyCompanyToken, getCategoriesTable);
router.get("/:id", verifyCompanyToken, getCategoryById);
router.put("/:id", verifyCompanyToken, updateCategory);
router.patch("/status/:id", verifyCompanyToken, toggleCategoryStatus);
router.delete("/:id", verifyCompanyToken, deleteCategory);

export default router;
