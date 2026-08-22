import { api } from "../api";

/**
 * GET ALL INVENTORY (company scoped)
 */
export async function getInventoryList(page = 1, limit = 10) {
  try {
    const res = await api.get("/company/inventory", {
      params: { page, limit },

      withCredentials: true,
    });

    if (!res?.data || res.data.status !== "success") {
      throw new Error("Invalid API response");
    }

    return {
      inventory: res.data.data || [],

      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error("Inventory fetch failed:", error.message);

    return {
      inventory: [],
      pagination: {
        totalItems: 0,
      },
    };
  }
}

/**
 * CREATE INVENTORY
 */
export async function createInventory(payload) {
  const res = await api.post("/company/inventory", payload, {
    withCredentials: true,
  });
  return res.data.data;
}

/**
 * UPDATE INVENTORY
 */
export async function updateInventory(id, payload) {
  const res = await api.put(`/company/inventory/${id}`, payload, {
    withCredentials: true,
  });
  return res.data.data;
}

/**
 * GET SINGLE INVENTORY
 */
export async function getInventoryById(id) {
  const res = await api.get(`/company/inventory/${id}`, {
    withCredentials: true,
  });
  return res.data.data;
}

/**
 * DELETE INVENTORY (optional)
 */
export async function deleteInventory(id) {
  const res = await api.delete(`/company/inventory/${id}`, {
    withCredentials: true,
  });
  return res.data;
}
