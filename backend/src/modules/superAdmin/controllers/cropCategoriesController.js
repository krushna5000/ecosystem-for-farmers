import {
  createCategory as createCategoryModel,
  getAllCategories as getAllCategoriesModel,
  getCategoryById as getCategoryByIdModel,
  updateCategory as updateCategoryModel,
  deleteCategory as deleteCategoryModel,
  bulkDeleteCategories as bulkDeleteCategoriesModel,
} from "../models/cropCategoriesModel.js";
import { isUniqueViolation } from "../utils/dbError.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const serverError = (res) => fail(res, 500, "Internal server error");

export const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body || {};

    if (!category_name) return fail(res, 400, "Category name is required");

    const category = await createCategoryModel(category_name, description);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    if (isUniqueViolation(error)) return fail(res, 409, "Category name already exists");
    serverError(res);
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const result = await getAllCategoriesModel(page, limit);

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result.data,
      pagination: buildPagination(page, limit, result.total),
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    serverError(res);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) return fail(res, 400, "Invalid category ID");

    const category = await getCategoryByIdModel(categoryId);
    if (!category) return fail(res, 404, "Category not found");

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error retrieving category:", error);
    serverError(res);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body || {};
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) return fail(res, 400, "Invalid category ID");
    if (!category_name) return fail(res, 400, "Category name is required");

    const category = await updateCategoryModel(categoryId, category_name, description);
    if (!category) return fail(res, 404, "Category not found");

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    if (isUniqueViolation(error)) return fail(res, 409, "Category name already exists");
    serverError(res);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) return fail(res, 400, "Invalid category ID");

    const category = await deleteCategoryModel(categoryId);
    if (!category) return fail(res, 404, "Category not found");

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    serverError(res);
  }
};

export const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return fail(res, 400, "Invalid category IDs");
    }

    const result = await bulkDeleteCategoriesModel(ids);
    if (result.deletedCount === 0) {
      return fail(res, 404, "No categories found with provided IDs");
    }

    res.status(200).json({
      success: true,
      message: "Categories deleted successfully",
      deletedCount: result.deletedCount,
      deletedIds: result.deletedIds,
    });
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    serverError(res);
  }
};
