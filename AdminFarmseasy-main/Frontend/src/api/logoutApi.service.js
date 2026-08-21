import axios from "axios";
import toast from "react-hot-toast";

// Use environment variable for backend URL
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

export const logoutUser = async (navigate) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/logout`,
      {},
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // send cookies
      },
    );

    if (response.status === 200) {
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 900);
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    toast.error("Logout failed!");
  }
};
