import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { domain } from "../utils/domain";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${domain}/superadmin/check-auth`, {
          withCredentials: true,
        });
        setIsAuthenticated(res.data?.authenticated || false);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Set login state after successful login
  const login = () => setIsAuthenticated(true);

  // Logout user and clear cookie
  const logout = async () => {
    try {
      const res = await axios.post(
        `${domain}/superadmin/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setIsAuthenticated(false);
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
