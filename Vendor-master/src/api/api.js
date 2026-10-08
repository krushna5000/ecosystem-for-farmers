import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if 401, not retried yet, AND the URL is not for login or refresh!
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/vendor/login") &&
      !originalRequest.url.includes("/vendor/refresh")
    ) {
      originalRequest._retry = true;
      try {
        // Call backend refresh endpoint
        await api.post("/vendor/refresh");
        // Retry the original request with the new cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (refresh token expired) → clear session
        localStorage.removeItem("vendorID");
        // Prevent infinite reload loop if already on the login page
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }

        // Pass the error back down to check-auth so it can safely stop loading
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
