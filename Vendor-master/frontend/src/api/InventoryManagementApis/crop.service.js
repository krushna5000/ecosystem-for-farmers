
import { api } from "../api";
const API_URL = "/crops"; // change according to your backend route

export const getAllCrops = async () => {
  const response = await api.get(API_URL, { withCredentials: true });
  return response.data?.crops || [];
};
