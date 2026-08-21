import { domain } from "../../utils/domain";
import axios from "axios";

// GET all pincodes
export const getAllPincodes = async () => {
  const res = await axios.get(`${domain}/location/pincodes`, {
    withCredentials: true,
  });
  return res.data.pincodes; // backend returns { success, pincodes: [...] }
};

// CREATE pincode
export const createPincode = async (data) => {
  const res = await axios.post(`${domain}/location/pincode`, data, {
    withCredentials: true,
  });
  return res.data || res.data; // backend uses both keys
};

// UPDATE pincode
export const updatePincode = async (id, data) => {
  const res = await axios.put(`${domain}/location/pincodes/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// DELETE pincode
export const deletePincode = async (id) => {
  const res = await axios.delete(`${domain}/location/pincodes/${id}`, {
    withCredentials: true,
  });
  return res.data || res.data;
};
