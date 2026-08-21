import axios from "axios";
import Card from "../components/Card";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useFarms } from "../context/FarmContext";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Droplets } from "lucide-react";
import AppLoader from "../components/Loaders/AppLoader";
import ActiveCrops from "../components/Dashboard/ActiveCrops";
import ActiveFarms from "../components/Dashboard/ActiveFarms";
import WeatherCard from "../components/Dashboard/WeatherCard";
import FarmCropStatsCard from "../components/Dashboard/FarmCropStatsCard";
import { NoFarms } from "../components/Dashboard/NoFarms";

export default function Dashboard() {
  const domain = import.meta.env.VITE_DOMAIN;
  const { user, loading: authLoading } = useAuth();
  const { farms, loading: farmsLoading } = useFarms();
  const [farmsWeather, setFarmsWeather] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const healthIcon = <Droplets className="text-yellow-400" size={18} />;
  const alertIcon = <AlertTriangle className="text-yellow-400" size={18} />;

  const fetchWeather = async () => {
    try {
      setWeatherLoading(true);
      if (!farms || farms.length === 0) return;

      // Fetch weather per farm SAFELY
      const farmsWithWeather = await Promise.all(
        farms.map(async (farm) => {
          const firstCoord = farm?.farm_coordinates?.[0];

          if (!firstCoord) {
            return {
              ...farm,
              weather: null,
              todayWeather: null,
            };
          }

          const [longitude, latitude] = firstCoord;
          const field_id = farm.field_id;

          const res = await axios.post(
            `${domain}/weather/get`,
            { latitude, longitude, field_id },
            { withCredentials: true },
          );

          const weatherData = res.data?.weather;

          return {
            ...farm,
            weather: weatherData, // full weather
            todayWeather: weatherData?.daily?.[0] || null, // ONLY today
          };
        }),
      );

      // STORE daily weather (DO NOT REMOVE)
      const weatherRes = await axios.post(
        `${domain}/weather/store-daily`,
        {
          user_id: user.id,
          farmsWithWeather,
        },
        { withCredentials: true },
      );

      // Update state
      setFarmsWeather(farmsWithWeather);
    } catch (error) {
      console.error("Weather fetch failed:", error);
      toast.error(error?.response?.data?.message || "Weather Fetch Error");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !farmsLoading && farms?.length > 0) {
      fetchWeather();
    }
  }, [farms.length]);

  if (authLoading || farmsLoading || weatherLoading) {
    return <AppLoader />;
  }

  return (
    <div className="w-full flex flex-col gap-8 mt-8 my-12">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {farmsWeather?.length > 0 && (
          <div className="md:col-span-2">
            <WeatherCard farms={farmsWeather} />
          </div>
        )}
        <FarmCropStatsCard
          farmCount={farms.length === 0 ? "0" : farms.length}
          cropCount={0}
        />
        <Card
          title="Avg. Health"
          count="88%"
          subtext="Overall Crop Health"
          icon={healthIcon}
          isUpcoming={true}
        ></Card>
        <Card
          title="Alerts"
          count="0"
          subtext="Requires Attention"
          icon={alertIcon}
          isUpcoming={true}
        ></Card>
      </div>

      {/* Active Farms */}
      {farms?.length > 0 ? <ActiveFarms farms={farms} /> : <NoFarms />}

      {/* Active Crops */}
      <ActiveCrops />
    </div>
  );
}
