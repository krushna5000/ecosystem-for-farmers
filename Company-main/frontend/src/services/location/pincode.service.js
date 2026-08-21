import { api } from "../api";

// GET all pincodes
export const getAllPincodes = async () => {
  const res = await api.get("/api/location/pincodes");
  return res.data.pincodes; // backend returns { success, pincodes: [...] }
};

// CREATE pincode
export const createPincode = async (data) => {
  const res = await api.post("/api/location/pincodes", data);
  return res.data.pincodes || res.data.pincode; // backend uses both keys
};

// UPDATE pincode
export const updatePincode = async (id, data) => {
  const res = await api.put(`/api/location/pincodes/${id}`, data);
  return res.data.pincode;
};

// DELETE pincode
export const deletePincode = async (id) => {
  const res = await api.delete(`/api/location/pincodes/${id}`);
  return res.data.pincodes || res.data.pincode;
};
