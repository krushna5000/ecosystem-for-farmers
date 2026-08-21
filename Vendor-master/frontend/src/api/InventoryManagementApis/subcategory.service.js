// src/services/subcategory.service.js
import { api } from "../api";

const BASE_URL = "/subcategories";

// MAP BACKEND → FRONTEND
function mapSubCategory(row) {
  return {
    id: row.id,
    name: row.sub_category_name,
    brandId: row.brand_id,
    categoryId: row.category_id,
    status: row.status ? "Active" : "Inactive",  // backend boolean → UI string
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET ALL
export async function getAllSubCategories() {
  try {
    const res = await api.get(BASE_URL, { withCredentials: true });
    // Backend returns { success: true, data: { subCategories: [...] } }
    const subCategories = Array.isArray(res.data?.data?.subCategories) 
      ? res.data.data.subCategories 
      : [];
    return subCategories.map(mapSubCategory).filter(Boolean);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
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

  return mapSubCategory(res.data?.data);
}

// UPDATE (status optional)
export async function updateSubCategory(id, { brandId, categoryId, name, status }) {
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
  console.log(res)
  return res;
}

export async function deleteMultipleSubCategories(ids) {
  try {
    const res = await api.post(
      `${BASE_URL}/bulk-delete`,
      { ids },
      { withCredentials: true }
    );

    return res.data;
  } catch (error) {
    console.error("Error deleting subcategories:", error);
    throw error;
  }
}