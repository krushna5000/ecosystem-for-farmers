import {
  createCategory as createCategoryModel,
  getAllCategories as getAllCategoriesModel,
  getCategoryById as getCategoryByIdModel,
  updateCategory as updateCategoryModel,
  deleteCategory as deleteCategoryModel,
  bulkDeleteCategories as bulkDeleteCategoriesModel
} from '../models/cropCategoriesModel.js';

/**
 * Create a new crop category
 * @param {Object} req 
 * @param {Object} res 
 */
export const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    // Validate required fields
    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await createCategoryModel(category_name, description);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all crop categories with pagination
 * @param {Object} req 
 * @param {Object} res 
 */
export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await getAllCategoriesModel(page, limit);
    
    const totalPages = Math.ceil(result.total / limit);
    
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a crop category by ID
 * @param {Object} req 
 * @param {Object} res 
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await getCategoryByIdModel(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    console.error('Error retrieving category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update a crop category
 * @param {Object} req 
 * @param {Object} res 
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await updateCategoryModel(categoryId, category_name, description);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a crop category
 * @param {Object} req 
 * @param {Object} res 
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await deleteCategoryModel(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Bulk delete crop categories
 * @param {Object} req 
 * @param {Object} res 
 */
export const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category IDs'
      });
    }

    const result = await bulkDeleteCategoriesModel(ids);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No categories found with provided IDs'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categories deleted successfully',
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds
    });
  } catch (error) {
    console.error('Error bulk deleting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
