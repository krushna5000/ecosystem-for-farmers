import { useEffect, useState } from "react";
import { CloudSun, Wind, Droplets, MapPin, Cloud, Sun } from "lucide-react";
import WeatherBG from "../../assets/weather.png";

const toCelsius = (k) => Math.round(k - 273.15);

export default function WeatherCard({ farms = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayFarms = farms.filter((f) => f?.todayWeather?.temp?.day);

  useEffect(() => {
    if (!displayFarms.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayFarms.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [displayFarms.length]);

  const farm = displayFarms[activeIndex];
  const weather = farm?.todayWeather;

  if (!weather) return null;

  const weatherCondition = weather.weather?.[0]?.main || "Clear";

  return (
    <div className="bg-white cursor-pointer rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Weather Body with Background Pattern */}
      <div
        className="relative border-b border-gray-200 overflow-hidden"
        style={{
          backgroundImage: `
      linear-gradient(
        to bottom right,
        rgba(255,255,255,0.35),
        rgba(255,255,255,0.45)
      ),
      url(${WeatherBG})
    `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="weather-pattern"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="1.5"
                  fill="currentColor"
                  className="text-gray-400"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#weather-pattern)" />
          </svg>
        </div>

        {/* Decorative Weather Icons in Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Cloud
            className="absolute top-2 right-8 text-white/10 animate-float"
            size={40}
            style={{ animationDelay: "0s", animationDuration: "8s" }}
          />
          <Cloud
            className="absolute bottom-4 left-4 text-white/10 animate-float"
            size={30}
            style={{ animationDelay: "2s", animationDuration: "10s" }}
          />
          <Sun
            className="absolute top-4 left-12 text-white/10 animate-spin-slow"
            size={35}
          />
        </div>

        <div
          key={farm.id}
          className="relative p-4 sm:p-5 flex flex-col gap-3 animate-fadeIn"
        >
          {/* Top Row: Location + Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/60 backdrop-blur-sm rounded-full p-1">
                <MapPin size={14} className="text-gray-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 leading-tight text-sm sm:text-base">
                  {farm.farm_name}
                </p>
                <p className="text-xs text-gray-600">{farm.village_name}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-full p-2 shadow-sm">
              <CloudSun
                size={22}
                className="text-amber-500"
                fill="currentColor"
                stroke="none"
              />
            </div>
          </div>

          {/* Temp Row */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 drop-shadow-sm">
                  {toCelsius(weather.temp.day)}°
                </span>
                <span className="text-sm sm:text-lg text-gray-700">C</span>
              </div>
              <p className="text-xs text-gray-700 font-medium">
                {weatherCondition}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-800">
            <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1">
              <Droplets size={12} className="text-blue-600" />
              <span className="font-medium">{weather.humidity}%</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1">
              <Wind size={12} className="text-gray-600" />
              <span className="font-medium">
                {Math.round(weather.wind_speed * 3.6)} km/h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {displayFarms.length > 1 && (
        <div className="py-4 flex justify-center gap-2 bg-white">
          {displayFarms.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-gray-800" : "w-1 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
