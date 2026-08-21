import axios from "axios";
import { domain } from "../utils/domain";

// Get all crops
export const getCrops = async () => {
  try {
    const res = await axios.get(`${domain}/crops/all`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error fetching crops:", error.response.data.message);
    throw error;
  }
};

// Create new crop
export const createCrop = async (payload) => {
  try {
    const res = await axios.post(`${domain}/crops/add`, payload, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error("Error creating crop:", error.response.data.message);
    throw error;
  }
};

// Update crop
export const updateCrop = async (id, payload) => {
  try {
    const res = await axios.put(`${domain}/crops/update/${id}`, payload, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error("Error updating crop:", error.response.data.message);
    throw error;
  }
};

// Delete crop
export const deleteCropApi = async (id) => {
  try {
    const res = await axios.delete(`${domain}/crops/delete/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error deleting crop:", error.response.data.message);
    throw error;
  }
};
