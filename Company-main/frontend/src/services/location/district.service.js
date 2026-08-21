import { api } from "../api";

// GET all districts
export const getAllDistricts = async () => {
  const res = await api.get("/api/location/districts");
  return res.data.districts; // backend returns { success, districts: [...] }
};

// CREATE district
export const createDistrict = async (data) => {
  const res = await api.post("/api/location/districts", data);
  return res.data.district;
};

// UPDATE district
export const updateDistrict = async (id, data) => {
  const res = await api.put(`/api/location/districts/${id}`, data);
  return res.data.district;
};

// DELETE district
export const deleteDistrict = async (id) => {
  const res = await api.delete(`/api/location/districts/${id}`);
  return res.data.district;
};
