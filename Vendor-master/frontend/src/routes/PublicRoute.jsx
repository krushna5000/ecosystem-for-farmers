import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/api";

export default function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const baseUrl=import.meta.env.VITE_API_URL

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/vendor/check-auth");
        setIsAuth(true);
      } catch (err) {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null;

  if (isAuth) return <Navigate to="/vendor/dashboard" replace />;

  return children;
}
