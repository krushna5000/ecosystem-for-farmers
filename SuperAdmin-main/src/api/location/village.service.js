import { domain } from "../../utils/domain";
import axios from "axios";

// GET all villages
export const getAllVillages = async () => {
  const res = await axios.get(`${domain}/location/villages`, {
    withCredentials: true,
  });
  return res.data.villages; // backend uses { villages: [...] }
};

// CREATE village
export const createVillage = async (data) => {
  const res = await axios.post(`${domain}/location/villages`, data, {
    withCredentials: true,
  });
  return res.data || res.data; // backend inconsistent in keys
};

// UPDATE village
export const updateVillage = async (id, data) => {
  const res = await axios.put(`${domain}/location/villages/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// DELETE village
export const deleteVillage = async (id) => {
  const res = await axios.delete(`${domain}/location/villages/${id}`, {
    withCredentials: true,
  });
  return res.data || res.data;
};
