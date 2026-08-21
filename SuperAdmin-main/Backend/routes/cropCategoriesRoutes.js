import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories
} from '../controllers/cropCategoriesController.js';

const router = express.Router();

// Create a new category
router.post('/', authMiddleware, createCategory);

// Get all categories
router.get('/', authMiddleware, getAllCategories);

// Bulk delete categories (must be BEFORE /:id routes)
router.delete('/bulk-delete', authMiddleware, bulkDeleteCategories);

// Get category by ID
router.get('/:id', authMiddleware, getCategoryById);

// Update category by ID
router.put('/:id', authMiddleware, updateCategory);

// Delete category by ID
router.delete('/:id', authMiddleware, deleteCategory);

export default router;
