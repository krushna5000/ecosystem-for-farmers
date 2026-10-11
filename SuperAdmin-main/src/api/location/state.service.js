import { domain } from "../../utils/domain";
import axios from "axios";

// GET all states
export const getAllStates = async () => {
  const res = await axios.get(`${domain}/location/states`, {
    withCredentials: true,
  });
  return res.data.states; // backend returns { success, states: [...] }
};

// GET single state
export const getStateById = async (id) => {
  const res = await axios.get(`${domain}/location/states/${id}`, {
    withCredentials: true,
  });
  return res.data.state;
};

// CREATE state
export const createState = async (data) => {
  const res = await axios.post(`${domain}/location/states`, data, {
    withCredentials: true,
  });
  return res.data;
};

// UPDATE state
export const updateState = async (id, data) => {
  const res = await axios.put(`${domain}/location/states/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// DELETE state
export const deleteState = async (id) => {
  const res = await axios.delete(`${domain}/location/states/${id}`, {
    withCredentials: true,
  });
  return res;
};
