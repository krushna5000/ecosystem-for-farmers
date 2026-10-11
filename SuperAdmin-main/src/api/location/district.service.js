import axios from "axios";
import { domain } from "../../utils/domain";

// GET all districts
export const getAllDistricts = async () => {
  const res = await axios.get(`${domain}/location/districts`, {
    withCredentials: true,
  });
  return res.data.districts; // backend returns { success, districts: [...] }
};

// CREATE district
export const createDistrict = async (data) => {
  const res = await axios.post(`${domain}/location/districts`, data, {
    withCredentials: true,
  });
  return res.data;
};

// UPDATE district
export const updateDistrict = async (id, data) => {
  const res = await axios.put(`${domain}/location/districts/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// DELETE district
export const deleteDistrict = async (id) => {
  const res = await axios.delete(`${domain}/location/districts/${id}`, {
    withCredentials: true,
  });
  return res.data;
};
