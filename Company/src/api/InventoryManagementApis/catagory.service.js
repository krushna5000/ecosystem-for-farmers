// src/services/category.service.js
import { api } from "../api";

const BASE_URL = "/company/categories";

// Convert backend -> frontend format
function mapCategory(row) {
  return {
    id: row.id,
    name: row.category_name,
    brandId: row.brand_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------
// GET ALL CATEGORIES (non-paginated for dropdowns)
// ---------------------------
export async function getAllCategories() {
  try {
    const res = await api.get(BASE_URL, {
      withCredentials: true,
    });

    if (!res?.data || res.data.success !== true) {
      throw new Error("Invalid API response");
    }

    return (res.data.data || []).map(mapCategory);
  } catch (error) {
    console.error("Get all categories failed:", error.message);

    return [];
  }
}

//GET ALL DATA (PAGINATED FOR TABLES)
export async function getCategoriesTable(page = 1, limit = 10) {
  try {
    const res = await api.get(`${BASE_URL}/table`, {
      params: { page, limit },

      withCredentials: true,
    });

    if (!res?.data || res.data.success !== true) {
      throw new Error("Invalid API response");
    }

    return {
      categories: (res.data.data || []).map(mapCategory),

      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error("Category table fetch failed:", error.message);

    return {
      categories: [],
      pagination: {
        totalItems: 0,
      },
    };
  }
}

// ---------------------------
// CREATE CATEGORY
// ---------------------------
export async function createCategory({ brandId, name }) {
  const payload = {
    brand_id: brandId,
    category_name: name,
  };

  const res = await api.post(`${BASE_URL}/create`, payload, {
    withCredentials: true,
  });

  // backend returns: { status, message, category: {...} }
  return mapCategory(res.data.category);
}

// ---------------------------
// UPDATE CATEGORY
// ---------------------------
export async function updateCategory(id, { brandId, name }) {
  const payload = {
    brand_id: brandId,
    category_name: name,
  };

  const res = await api.put(`${BASE_URL}/${id}`, payload, {
    withCredentials: true,
  });

  // backend returns: { status, message, data: {...} }
  return mapCategory(res.data.data);
}

// ---------------------------
// DELETE CATEGORY
// ---------------------------
export async function deleteCategory(id) {
  const res = await api.delete(`${BASE_URL}/${id}`, {
    withCredentials: true,
  });

  return res.data;
}

export async function deleteMultipleCategories(ids) {
  try {
    const res = await api.post(
      `${BASE_URL}/bulk-delete`,
      { ids },
      { withCredentials: true },
    );
    return res.data;
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    throw error;
  }
}
