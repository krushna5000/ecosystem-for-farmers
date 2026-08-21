import axios from "axios";
import { domain } from "../utils/domain";

const BASE_URL = `${domain}/crop-categories`;

// Get all categories
export const getCategories = async () => {
  try {
    const res = await axios.get(BASE_URL, { withCredentials: true });
    return res;
  } catch (error) {
    console.error("Error fetching crop categories:", error);
    throw error;
  }
};

// Create new category
export const createCategory = async (payload) => {
  try {
    const res = await axios.post(BASE_URL, payload, { withCredentials: true });
    return res;
  } catch (error) {
    console.error("Error creating crop category:", error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id, payload) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, payload, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error updating crop category:", error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (deleteCategoryData) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${deleteCategoryData.id}`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error deleting crop category:", error);
    throw error;
  }
};
