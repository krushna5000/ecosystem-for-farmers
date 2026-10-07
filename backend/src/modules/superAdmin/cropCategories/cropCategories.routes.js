import express from "express";
import { authMiddleware } from "../../../middleware/superAdmin/auth.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
} from "./cropCategories.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, getAllCategories);
// must be BEFORE /:id routes
router.delete("/bulk-delete", authMiddleware, bulkDeleteCategories);
router.get("/:id", authMiddleware, getCategoryById);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;
