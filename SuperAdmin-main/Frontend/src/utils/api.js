import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:3000/api",
});

// it will automatically add the authorization token in the header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
