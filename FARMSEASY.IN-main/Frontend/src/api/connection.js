import axios from "axios";
import { domain } from "../utils/domain.js";

// 🔐 Get token from local storage (optional, if your API requires auth)
const getToken = () => localStorage.getItem("token");

// ----------------------------
// CREATE CONNECTION
// ----------------------------
export const createConnection = async (payload) => {
  try {
    const token = getToken();
    const response = await axios.post(`${domain}/connections`, payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : { Accept: "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error;
  }
};

// ----------------------------
// GET ALL CONNECTIONS
// ----------------------------
export const getConnections = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${domain}/connections`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : { Accept: "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching connections:", error);
    throw error;
  }
};

// ----------------------------
// UPDATE CONNECTION
// ----------------------------
export const updateConnection = async (connectionId, payload) => {
  try {
    const token = getToken();
    const response = await axios.put(
      `${domain}/connections/${connectionId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating connection:", error);
    throw error;
  }
};

// ----------------------------
// DELETE CONNECTION
// ----------------------------
export const deleteConnection = async (connectionId) => {
  try {
    const token = getToken();
    const response = await axios.delete(
      `${domain}/connections/${connectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting connection:", error);
    throw error;
  }
};


export const deleteMultipleConnections = async (ids) => {
  try {
    const token = getToken();

    const res = await axios.delete(`${domain}/connections/bulk-delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { ids }, // ⚠️ important
    });

    return res;
  } catch (err) {
    console.error("Error deleting connections:", err);
    throw err;
  }
};