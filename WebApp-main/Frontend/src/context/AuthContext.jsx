import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const domain = import.meta.env.VITE_DOMAIN;

  const navigate = useNavigate();

  // Verify token on app load
  const verifyAuth = async () => {
    try {
      const res = await axios.get(`${domain}/auth/verify-auth`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
        navigate("/");
      }
    } catch {
      setUser(null);
      navigate("/");
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
