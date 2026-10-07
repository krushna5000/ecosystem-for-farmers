// src/services/brand.service.js
import { api } from "../api";

const BASE_URL = import.meta.env.VITE_API_URL;

function normalizeStatus(status) {
  return status === "Active" ? true : false;
}

// Map backend → frontend format
function mapBrand(row) {
  return {
    id: row.id,
    name: row.brand_name,
    status: row.status ? "Active" : "Inactive",
    logoUrl: row.logo || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --------------------------------------
// GET ALL BRANDS for dropdowns cause we need all data
// --------------------------------------
export async function getAllBrands() {
  try {
    const res = await api.get("/company/brands", {
      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return (res.data.data || []).map(mapBrand);
  } catch (error) {
    console.error("Get all brands failed:", error.message);

    return [];
  }
}

//Get all brands for table (paginated)
export async function getBrandsTable(page = 1, limit = 10) {
  try {
    const res = await api.get("/company/brands/table", {
      params: { page, limit },

      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return {
      brands: (res.data.data || []).map(mapBrand),

      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error("Get brands table failed:", error.message);

    return {
      brands: [],
      pagination: {
        totalItems: 0,
      },
    };
  }
}

// --------------------------------------
// CREATE BRAND (FormData + file upload using multer)
// --------------------------------------
export async function createBrand({ name, status, logoFile }) {
  const formData = new FormData();

  formData.append("brand_name", name);
  formData.append("status", normalizeStatus(status));

  if (logoFile) {
    formData.append("logo", logoFile); // backend receives req.file
  }

  const res = await api.post("/company/brands/create", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapBrand(res.data.data);
}

// --------------------------------------
// UPDATE BRAND (supports file upload or no file)
// --------------------------------------
export async function updateBrand(id, { name, status, logoFile }) {
  const formData = new FormData();

  if (name) formData.append("brand_name", name);
  if (status !== undefined) {
    formData.append("status", normalizeStatus(status)); // FIXED
  }
  if (logoFile) formData.append("logo", logoFile);

  const res = await api.put(`/company/brands/${id}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapBrand(res.data.data);
}

// --------------------------------------
// DELETE BRAND
// --------------------------------------
export async function deleteBrand(id) {
  const res = await api.delete(`/company/brands/${id}`, {
    withCredentials: true,
  });

  return res.data;
}
// -------------------- BULK DELETE BRANDS --------------------
export async function deleteMultipleBrands(ids) {
  const res = await api.post(
    "/company/brands/bulk-delete",
    { ids },
    {
      withCredentials: true,
    },
  );

  return res.data;
}
