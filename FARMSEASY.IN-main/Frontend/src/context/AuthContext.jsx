import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { domain } from "../utils/domain";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${domain}/login`, {
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
      await axios.post(
        `${domain}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      setIsAuthenticated(false);
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
