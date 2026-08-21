import apiClient from "./axios";

const apiService = {
  /**
   * Submits farm boundary data to the backend
   * @param {Object} farmData - { coordinates: Array, area_hectares: Number }
   */
  submitFarmBoundary: async (farmData) => {
    try {
      const response = await apiClient.post("/farm", farmData);
      return response.data;
    } catch (error) {
      // Re-throw the error to be handled by the UI component
      throw error.response?.data || error.message;
    }
  },

  // You can easily add more services here later, like:
  // getFarmData: () => apiClient.get("/farm/all"),
};

export default apiService;