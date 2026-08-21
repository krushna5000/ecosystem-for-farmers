import axios from "axios";

const apiClient = axios.create({
  // Point this to your Express server URL
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;