import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { user } = useAuth();
  const domain = import.meta.env.VITE_DOMAIN;

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  // prevents duplicate fetches
  const hasFetched = useRef(false);

  const fetchFarms = async () => {
    if (!user || hasFetched.current) return;

    try {
      setLoading(true);

      const res = await axios.get(`${domain}/farms/get-farms/${user.id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setFarms(res.data.data);
        hasFetched.current = true;
      }
    } catch (err) {
      console.error("Farm fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch once when user is ready
  useEffect(() => {
    fetchFarms();
  }, [user]);

  return (
    <FarmContext.Provider value={{ farms, loading, fetchFarms }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarms = () => useContext(FarmContext);
