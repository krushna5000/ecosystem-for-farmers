import { api } from "../api";

// GET all states
export const getAllStates = async () => {
  const res = await api.get("/api/location/states");
  return res.data.states; // backend returns { success, states: [...] }
};

// GET single state
export const getStateById = async (id) => {
  const res = await api.get(`/api/location/states/${id}`);
  return res.data.state;
};

// CREATE state
export const createState = async (data) => {
  const res = await api.post("/api/location/states", data);
  return res.data.state;
};

// UPDATE state
export const updateState = async (id, data) => {
  const res = await api.put(`/api/location/states/${id}`, data);
  return res.data.state;
};

// DELETE state
export const deleteState = async (id) => {
  const res = await api.delete(`/api/location/states/${id}`);
  return res.data.state;
};
