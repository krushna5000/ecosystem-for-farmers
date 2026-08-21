import { api } from "../api";
const API_URL = "/crops"; 

export const getAllCrops = async () => {
  try {
    const response = await api.get(API_URL, { withCredentials: true });
    // console.log("getAllCrops API response:", response.data);
    
    return response.data?.data || []; 

  } catch (error) {
    console.error("Error fetching crops:", error.response?.data || error.message);
        return []; 
  }
};