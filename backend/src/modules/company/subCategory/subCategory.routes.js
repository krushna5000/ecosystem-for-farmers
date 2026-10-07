import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
  deleteSubCategories,
  getSubCategoriesTable,
} from "./subCategory.controller.js";

import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteSubCategories);
router.post("/", verifyCompanyToken, createSubCategory);
router.get("/", verifyCompanyToken, getAllSubCategories);
router.get("/table", verifyCompanyToken, getSubCategoriesTable);
router.get("/:id", verifyCompanyToken, getSubCategoryById);
router.put("/:id", verifyCompanyToken, updateSubCategory);
router.patch("/status/:id", verifyCompanyToken, toggleSubCategoryStatus);
router.delete("/:id", verifyCompanyToken, deleteSubCategory);

export default router;
