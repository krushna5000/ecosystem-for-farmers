import { api } from "../api";

// GET all villages
export const getAllVillages = async () => {
  const res = await api.get("/api/location/villages");
  return res.data.villages; // backend uses { villages: [...] }
};

// CREATE village
export const createVillage = async (data) => {
  const res = await api.post("/api/location/villages", data);
  return res.data.village || res.data.villages; // backend inconsistent in keys
};

// UPDATE village
export const updateVillage = async (id, data) => {
  const res = await api.put(`/api/location/villages/${id}`, data);
  return res.data.village;
};

// DELETE village
export const deleteVillage = async (id) => {
  const res = await api.delete(`/api/location/villages/${id}`);
  return res.data.village || res.data.villages;
};
