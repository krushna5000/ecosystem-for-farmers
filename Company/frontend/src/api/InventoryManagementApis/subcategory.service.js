// src/services/subcategory.service.js
import { api } from "../api";

const BASE_URL = "/company/subcategories";

// MAP BACKEND → FRONTEND
function mapSubCategory(row) {
  return {
    id: row.id,
    name: row.sub_category_name,
    brandId: row.brand_id,
    categoryId: row.category_id,
    status: row.status ? "Active" : "Inactive",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET ALL SUBCATEGORIES (NON-PAGINATED FOR DROPDOWNS)
export async function getAllSubCategories() {
  try {
    const res = await api.get(BASE_URL, {
      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return (res.data.data || []).map(mapSubCategory);
  } catch (error) {
    console.error("Get all subcategories failed:", error.message);

    return [];
  }
}

//GET ALL SUB-CATEGORIES(PAGINATED FOR TABLES)
export async function getSubCategoriesTable(page = 1, limit = 10) {
  try {
    const res = await api.get(`${BASE_URL}/table`, {
      params: { page, limit },

      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return {
      subcategories: (res.data.data || []).map(mapSubCategory),

      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error("Subcategory table fetch failed:", error.message);

    return {
      subcategories: [],
      pagination: {
        totalItems: 0,
      },
    };
  }
}

// CREATE  (NO STATUS SENT)
export async function createSubCategory({ brandId, categoryId, name }) {
  const payload = {
    brand_id: Number(brandId),
    category_id: Number(categoryId),
    sub_category_name: name.trim(),
  };

  const res = await api.post(BASE_URL, payload, {
    withCredentials: true,
  });

  return mapSubCategory(res.data.data);
}

// UPDATE (status optional)
export async function updateSubCategory(
  id,
  { brandId, categoryId, name, status },
) {
  const payload = {
    brand_id: Number(brandId),
    category_id: Number(categoryId),
    sub_category_name: name.trim(),
    status: status ? (status === "Active" ? true : false) : undefined,
  };

  const res = await api.put(`${BASE_URL}/${id}`, payload, {
    withCredentials: true,
  });

  return mapSubCategory(res.data.data);
}

// TOGGLE STATUS
export async function toggleSubCategoryStatus(id) {
  const res = await api.patch(`${BASE_URL}/status/${id}`, null, {
    withCredentials: true,
  });

  return mapSubCategory(res.data.data);
}

// DELETE
export async function deleteSubCategory(id) {
  const res = await api.delete(`${BASE_URL}/${id}`, {
    withCredentials: true,
  });

  return res.data.data;
}

export async function deleteMultipleSubCategories(ids) {
  try {
    const res = await api.post(
      `${BASE_URL}/bulk-delete`,
      { ids },
      { withCredentials: true },
    );

    return res.data;
  } catch (error) {
    console.error("Error deleting subcategories:", error);
    throw error;
  }
}
