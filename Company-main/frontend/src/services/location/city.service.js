import { api } from "../api";

// GET all cities
export const getAllCities = async () => {
  const res = await api.get("/api/location/cities");
  return res.data.cities; // backend returns { success, cities: [...] }
};

// CREATE city
export const createCity = async (data) => {
  const res = await api.post("/api/location/cities", data);
  return res.data.city;
};

// UPDATE city
export const updateCity = async (id, data) => {
  const res = await api.put(`/api/location/cities/${id}`, data);
  return res.data.city;
};

// DELETE city
export const deleteCity = async (id) => {
  const res = await api.delete(`/api/location/cities/${id}`);
  return res.data.city;
};
