import { domain } from "../../utils/domain";
import axios from "axios";

// GET all cities
export const getAllCities = async () => {
  const res = await axios.get(`${domain}/location/cities`, {
    withCredentials: true,
  });
  return res.data.cities; // backend returns { success, cities: [...] }
};

// CREATE city
export const createCity = async (data) => {
  // console.log(data);
  const res = await axios.post(`${domain}/location/cities`, data, {
    withCredentials: true,
  });
  return res.data;
};

// UPDATE city
export const updateCity = async (id, data) => {
  const res = await axios.put(`${domain}/location/cities/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// DELETE city
export const deleteCity = async (id) => {
  const res = await axios.delete(`${domain}/location/cities/${id}`, {
    withCredentials: true,
  });
  return res.data;
};
