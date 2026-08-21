import axios from "axios";

// Use frontend environment variable for backend URL
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// Axios instance with credentials
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies
  headers: {
    Accept: "application/json",
  },
});

// Get all companies
export const getCompanies = async () => {
  try {
    const response = await axiosInstance.get("/companies");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error fetching companies:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Create a company
export const createCompany = async (companyData) => {
  try {
    const response = await axiosInstance.post("/companies/add-company", companyData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Update a company
export const updateCompany = async (companyId, companyData) => {
  try {
    const response = await axiosInstance.put(
      `/companies/${companyId}`,
      companyData,
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Delete a company
export const deleteCompany = async (companyId) => {
  try {
    const response = await axiosInstance.delete(`/companies/${companyId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting company:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Get company types
export const getCompanyTypes = async () => {
  try {
    const response = await axiosInstance.get("/company-types");
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error fetching company types:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Toggle company active/inactive status
export const toggleCompanyStatus = (companyId) => {
  return axiosInstance.patch(`/companies/${companyId}/toggle-active`);
};
