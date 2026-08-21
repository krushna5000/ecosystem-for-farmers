import WeatherHero from "../components/weather/WeatherHero";
import ForecastSection from "../components/weather/ForecastSection";
import TemperatureChart from "../components/weather/TemperatureChart";
import SensorCard from "../components/weather/SensorCard";
import PrecipitationCard from "../components/weather/PrecipitationCard";
import HumidityCard from "../components/weather/HumidityCard";
import AIInsightCard from "../components/weather/AIInsightCard";

import {
  Droplets,
  Waves,
  ThermometerSun,
} from "lucide-react";

const Weather = () => {
  const weatherData = {
    hero: {
      location: "Central Valley Research Zone • Sector 7",
      temp: "24°C",
      condition: "Partly Cloudy",
      wind: "12 km/h NW",
      visibility: "10 km",
      uv: "4 (Moderate)",
      updatedAt: "2m ago",
    },

    risks: [
      {
        title: "Drought Risk",
        subtitle: "Level 2: Monitoring Required",
        progress: 50,
        icon: Droplets,
        color: "bg-yellow-100 text-yellow-600",
      },

      {
        title: "Flood Risk",
        subtitle: "Level 0: No Current Threat",
        progress: 15,
        icon: Waves,
        color: "bg-green-100 text-green-600",
      },

      {
        title: "Heat Stress",
        subtitle: "Moderate Stress Threshold",
        progress: 75,
        icon: ThermometerSun,
        color: "bg-red-100 text-red-600",
      },
    ],

    forecast: [
      {
        day: "MON, 12",
        temp: "22°",
        low: "14°",
        rain: "85% Precip",
        active: false,
      },

      {
        day: "TUE, 13",
        temp: "24°",
        low: "16°",
        rain: "12% Precip",
        active: false,
      },

      {
        day: "WED, 14",
        temp: "28°",
        low: "19°",
        rain: "0% Precip",
        active: true,
      },

      {
        day: "THU, 15",
        temp: "26°",
        low: "17°",
        rain: "5% Precip",
        active: false,
      },

      {
        day: "FRI, 16",
        temp: "25°",
        low: "15°",
        rain: "10% Precip",
        active: false,
      },

      {
        day: "SAT, 17",
        temp: "21°",
        low: "13°",
        rain: "95% Precip",
        active: false,
      },

      {
        day: "SUN, 18",
        temp: "19°",
        low: "12°",
        rain: "Storm Alert",
        active: false,
      },
    ],

    temperatureChart: {
      maxTemp: "28.4°C",

      chart: [
        {
          time: "00:00",
          value: 80,
        },

        {
          time: "04:00",
          value: 70,
        },

        {
          time: "08:00",
          value: 60,
        },

        {
          time: "12:00",
          value: 150,
          active: true,
        },

        {
          time: "16:00",
          value: 120,
        },

        {
          time: "20:00",
          value: 90,
        },

        {
          time: "23:59",
          value: 60,
        },
      ],
    },

    sensors: [
      {
        title: "Air Pressure",
        value: "1012.4 hPa",
      },

      {
        title: "Air Quality (O3)",
        value: "Good (24)",
      },

      {
        title: "Dew Point",
        value: "11°C",
      },

      {
        title: "Daylight Duration",
        value: "13h 42m",
      },
    ],

    moon: {
      phase: "Waxing Crescent",
      illumination: "18%",
    },

    precipitation: [
      {
        day: "MON",
        value: 20,
      },

      {
        day: "TUE",
        value: 10,
      },

      {
        day: "WED",
        value: 120,
      },

      {
        day: "THU",
        value: 90,
      },

      {
        day: "FRI",
        value: 30,
      },

      {
        day: "SAT",
        value: 0,
      },
    ],

    humidity: {
      value: 68,
      average: 64,
    },

    aiInsight: {
      message:
        "Incoming low-pressure system detected. High probability of rainfall exceeding 5mm on Sat/Sun. Recommend adjusting irrigation schedules for Maize blocks 4 through 9 by -30% immediately.",
    },
  };

  return (
    <main className="flex-1 p-8 bg-[#F4F6F8] min-h-screen">
      
      {/* Hero Section */}
      <div className="grid grid-cols-12 gap-6">
        
        <WeatherHero
          data={weatherData.hero}
          risks={weatherData.risks}
        />
      </div>

      {/* Forecast */}
      <ForecastSection
        forecast={weatherData.forecast}
      />

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-6 mt-10">
        
        <TemperatureChart
          data={weatherData.temperatureChart}
        />

        <SensorCard
          sensors={weatherData.sensors}
          moon={weatherData.moon}
        />

        <PrecipitationCard
          data={weatherData.precipitation}
        />

        <HumidityCard
          humidity={weatherData.humidity}
        />

        <AIInsightCard
          insight={weatherData.aiInsight}
        />
      </div>
    </main>
  );
};

export default Weather;