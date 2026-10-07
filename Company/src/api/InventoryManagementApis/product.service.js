// src/api/InventoryManagementApis/product.service.js
import { api } from "../../api/api";

const BASE_URL = "/company/products";

// -------------------------
// MAP BACKEND → FRONTEND
// -------------------------
function mapProduct(row) {
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
      : [],

    crop_ids: Array.isArray(row.crop_ids)
      ? row.crop_ids
      : row.crop_ids
        ? JSON.parse(row.crop_ids)
        : [],

    disease_names: Array.isArray(row.disease_names)
      ? row.disease_names
      : row.disease_names
        ? JSON.parse(row.disease_names)
        : [],

    imageUrl: row.image || null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// -------------------------
// GET ALL PRODUCTS (NON-PAGINATED FOR DROPDOWNS)
// -------------------------
export async function getAllProducts() {
  try {
    const res = await api.get(BASE_URL, {
      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return (res.data.data || []).map(mapProduct);
  } catch (error) {
    console.error("Get all products failed:", error.message);

    return [];
  }
}

//GET ALL PRODUCTS (PAGINATED FOR TABLES)
export async function getProductsTable(page = 1, limit = 10) {
  try {
    const res = await api.get(`${BASE_URL}/table`, {
      params: { page, limit },

      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return {
      products: (res.data.data || []).map(mapProduct),

      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error("Product table fetch failed:", error.message);

    return {
      products: [],
      pagination: {
        totalItems: 0,
      },
    };
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
    JSON.stringify(payload.chemicalComposition),
  );

  formData.append(
    "crop_ids",
    JSON.stringify(
      Array.isArray(payload.crop_ids) ? payload.crop_ids : [payload.crop_ids],
    ),
  );

  formData.append("disease_names", JSON.stringify(payload.disease_names || []));

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.post(BASE_URL, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProduct(res.data.data);
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
    JSON.stringify(payload.chemicalComposition),
  );

  console.log(payload.crop_ids);
  // 🔹 Crop IDs (IMPORTANT)
  formData.append("crop_ids", JSON.stringify(payload.crop_ids || []));

  // 🔹 Disease Names
  formData.append("disease_names", JSON.stringify(payload.disease_names || []));

  // only append image if uploading new file
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const res = await api.put(`${BASE_URL}/${id}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapProduct(res.data.data);
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

//bulk delete

export async function deleteMultipleProducts(ids) {
  try {
    const res = await api.post(
      `${BASE_URL}/bulk-delete`,
      { ids },
      { withCredentials: true },
    );
    return res.data;
  } catch (error) {
    console.error("Error bulk deleting Products:", error);
    throw error;
  }
}
