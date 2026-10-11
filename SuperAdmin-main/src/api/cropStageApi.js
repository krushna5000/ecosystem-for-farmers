// src/api/cropStageApi.js
import axios from "axios";
import { domain } from "../utils/domain";

const BASE_URL = `${domain}/crop-stages`;

// Get all crop stages
export const getStages = async () => {
  try {
    const res = await axios.get(BASE_URL, { withCredentials: true });
    return res;
  } catch (error) {
    console.error("Error fetching crop stages:", error.response.data.message);
    throw error;
  }
};

// Create a new stage
export const createStage = async (payload) => {
  try {
    const res = await axios.post(BASE_URL, payload, { withCredentials: true });
    return res;
  } catch (error) {
    console.error("Error creating crop stage:", error.response.data.message);
    throw error;
  }
};

// Update stage
export const updateStage = async (id, payload) => {
  try {
    const res = await axios.put(`${BASE_URL}/${id}`, payload, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error updating crop stage:", error.response.data.message);
    throw error;
  }
};

// Delete stage
export const deleteStage = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.error("Error deleting crop stage:", error.response.data.message);
    throw error;
  }
};
