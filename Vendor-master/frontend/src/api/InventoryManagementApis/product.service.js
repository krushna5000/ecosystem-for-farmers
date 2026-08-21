// src/api/InventoryManagementApis/product.service.js
import { api } from "../../api/api";

const BASE_URL = "/products";

// -------------------------
// MAP BACKEND → FRONTEND
// -------------------------
function mapProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brand_name,

    categoryId: row.category_id,
    categoryName: row.category_name,

    subCategoryId: row.sub_category_id,
    subCategoryName: row.sub_category_name,

    name: row.product_name,
    description: row.description,

    chemicalComposition: row.chemical_composition
      ? typeof row.chemical_composition === "string"
        ? JSON.parse(row.chemical_composition)
        : row.chemical_composition
      : {
          nitrogen: "",
          phosphorus: "",
          potassium: "",
        },

    crop_ids: Array.isArray(row.crop_ids)
      ? row.crop_ids
      : row.crop_ids
      ? JSON.parse(row.crop_ids)
      : [],

    imageUrl: row.image || null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// -------------------------
// GET ALL PRODUCTS
// -------------------------
let controller;

export async function getAllProducts(page = 1, limit = 10) {
  try {
    const controller = new AbortController(); // ✅ local

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    const res = await api.get(BASE_URL, {
      params: { page: safePage, limit: safeLimit },
      withCredentials: true,
      signal: controller.signal,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return {
      products: (res?.data?.data?.data || []).map(mapProduct),
      pagination: res?.data?.data?.pagination || {},
    };

  } catch (error) {
    if (error.name === "CanceledError") {
      return {
        products: [],
        pagination: { total: 0 }
      };
    }

    console.error("Product fetch failed:", error.message);
    throw error;
  }
}

// -------------------------
// CREATE PRODUCT (FORMDATA)
// -------------------------
export async function createProduct(payload) {
  const formData = new FormData();

  formData.append("brand_id", payload.brandId);
  formData.append("category_id", payload.categoryId);
  formData.append("sub_category_id", payload.subCategoryId);
  formData.append("product_name", payload.name);
  formData.append("description", payload.description || "");

  formData.append(
    "chemical_composition",
    JSON.stringify(payload.chemicalComposition)
  );

  formData.append(
    "crop_ids",
    JSON.stringify(
      Array.isArray(payload.crop_ids) ? payload.crop_ids : [payload.crop_ids]
    )
  );

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.post(BASE_URL, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProduct(res.data?.data || res.data?.product);
}

// -------------------------
// UPDATE PRODUCT (FORMDATA)
// -------------------------
export async function updateProduct(id, payload) {
  const formData = new FormData();

  formData.append("brand_id", payload.brandId);
  formData.append("category_id", payload.categoryId);
  formData.append("sub_category_id", payload.subCategoryId);
  formData.append("product_name", payload.name);
  formData.append("description", payload.description || "");

  formData.append(
    "chemical_composition",
    JSON.stringify(payload.chemicalComposition || [])
  );

  formData.append("crop_ids", JSON.stringify(payload.crop_ids || []));

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.put(`${BASE_URL}/${id}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProduct(res.data?.data || res.data?.product);
}

// -------------------------
// DELETE PRODUCT
// -------------------------
export async function deleteProduct(id) {
  const res = await api.delete(`${BASE_URL}/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

export async function deleteMultipleProducts(ids) {
  try {
    const res = await api.post(`${BASE_URL}/bulk-delete`, { ids }, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error bulk deleting Products:", error);
    throw error;
  }
}
