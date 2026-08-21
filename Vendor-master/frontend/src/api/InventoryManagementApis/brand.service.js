// src/services/brand.service.js
import { api } from "../api";

// -------------------- HELPERS --------------------
function normalizeStatus(status) {
  return status === "Active" ? true : false;
}

// Map backend → frontend format (SAFE)
function mapBrand(row) {
  if (!row) return null;

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.brand_name,
    status: row.status ? "Active" : "Inactive",
    logoUrl:
      row.logo && row.logo !== "/uploads/brands/undefined"
        ? encodeURI(row.logo)
        : null,
  };
}

// -------------------- GET ALL BRANDS --------------------
export async function getAllBrands() {
  const res = await api.get("/brands", {
    withCredentials: true,
  });

  const brands = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
  return brands.map(mapBrand).filter(Boolean);
}

// -------------------- GET BRAND BY ID --------------------
export async function getBrandById(id) {
  const res = await api.get(`/brands/${id}`, {
    withCredentials: true,
  });

  return mapBrand(res.data?.data);
}

// -------------------- CREATE BRAND --------------------
export async function createBrand({ name, status, logoFile }) {
  if (!logoFile) {
    throw new Error("Logo is required");
  }

  const formData = new FormData();
  formData.append("brand_name", name);
  formData.append("status", normalizeStatus(status));
  formData.append("logo", logoFile);

  const res = await api.post("/brands", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return mapBrand(res.data?.data);
}

// -------------------- UPDATE BRAND --------------------
export async function updateBrand(id, { name, status, logoFile }) {
  const formData = new FormData();

  if (name) formData.append("brand_name", name);
  if (status !== undefined) {
    formData.append("status", normalizeStatus(status));
  }
  if (logoFile) formData.append("logo", logoFile);

  const res = await api.put(`/brands/${id}`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return mapBrand(res.data?.data || res.data?.brand);
}

// -------------------- DELETE BRAND --------------------
export async function deleteBrand(id) {
  const res = await api.delete(`/brands/${id}`, {
    withCredentials: true,
  });

  return res.data;
}

// -------------------- BULK DELETE BRANDS --------------------
export async function deleteMultipleBrands(ids) {
  const res = await api.post(
    "/brands/bulk-delete",
    { ids },
    {
      withCredentials: true,
    }
  );

  return res.data;
}