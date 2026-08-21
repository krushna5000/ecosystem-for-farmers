import axios from "axios";

// Use frontend environment variable for backend URL
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// GET ALL VENDORS
export const getVendors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/vendors`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching vendors:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// CREATE VENDOR
export const createVendor = async (vendorData) => {
  try {
    const response = await axios.post(`${BASE_URL}/vendors`, vendorData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating vendor:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// UPDATE VENDOR
export const updateVendor = async (vendorId, vendorData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/vendors/${vendorId}`,
      vendorData,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating vendor:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// DELETE VENDOR
export const deleteVendor = async (vendorId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/vendors/${vendorId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting vendor:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// TOGGLE VENDOR STATUS
export const toggleVendorStatus = async (vendorId) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/vendors/${vendorId}/toggle-active`,
      {},
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling vendor status:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
