// src/api/InventoryManagementApis/catagory.service.js
import { api } from "../../api/api";

const BASE_URL = "/categories";

// -------------------------
// MAP BACKEND → FRONTEND
// -------------------------
function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.category_name,
    brandId: row.brand_id,
    status: row.status ? "Active" : "Inactive",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// -------------------------
// GET ALL CATEGORIES
// -------------------------
export async function getAllCategories() {
  try {
    const res = await api.get(BASE_URL, { withCredentials: true });
    // Backend returns { success: true, data: { categories: [...] } }
    const categories = Array.isArray(res.data?.data?.categories) 
      ? res.data.data.categories 
      : [];
    return categories.map(mapCategory).filter(Boolean);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// -------------------------
// GET CATEGORY BY ID
// -------------------------
export async function getCategoryById(id) {
  try {
    const res = await api.get(`${BASE_URL}/${id}`, { withCredentials: true });
    return mapCategory(res.data?.category || res.data?.data);
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

// -------------------------
// CREATE CATEGORY
// -------------------------
export async function createCategory({ brandId, name }) {
  const payload = {
    brand_id: Number(brandId),
    category_name: name.trim(),
  };

  try {
    const res = await api.post(BASE_URL, payload, { withCredentials: true });
    return mapCategory(res.data?.category || res.data?.data);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

// -------------------------
// UPDATE CATEGORY
// -------------------------
export async function updateCategory(id, { brandId, name }) {
  const payload = {
    brand_id: Number(brandId),
    category_name: name.trim(),
  };

  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload, { withCredentials: true });
    return mapCategory(res.data?.data);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

// -------------------------
// TOGGLE STATUS
// -------------------------
export async function toggleCategoryStatus(id) {
  try {
    const res = await api.patch(`${BASE_URL}/status/${id}`, {}, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error toggling category status:", error);
    throw error;
  }
}

// -------------------------
// DELETE CATEGORY
// -------------------------
export async function deleteCategory(id) {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// -------------------------
// BULK DELETE
// -------------------------
export async function deleteMultipleCategories(ids) {
  try {
    const res = await api.post(`${BASE_URL}/bulk-delete`, { ids }, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    throw error;
  }
}
