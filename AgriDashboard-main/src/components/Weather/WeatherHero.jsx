import { CloudSun, MapPin } from "lucide-react";
import RiskCard from "./RiskCard";

const WeatherHero = ({ data, risks }) => {
  return (
    <>
      <div className="col-span-8 relative overflow-hidden rounded-[32px] p-10 min-h-[330px] text-white bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200')] bg-cover bg-center">
        
        <div className="absolute inset-0 bg-[#032B1F]/70" />

        <div className="relative z-10 h-full flex justify-between">
          
          <div className="flex flex-col justify-between">
            <div>
              
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={18} />

                <span className="text-lg">
                  {data.location}
                </span>
              </div>

              <div className="flex items-end gap-4">
                <h1 className="text-8xl font-bold leading-none">
                  {data.temp}
                </h1>

                <p className="text-3xl mb-3">
                  {data.condition}
                </p>
              </div>
            </div>

            <div className="flex gap-12">
              
              <div>
                <p className="uppercase text-xs tracking-widest text-gray-300">
                  Wind Speed
                </p>

                <p className="text-2xl font-semibold">
                  {data.wind}
                </p>
              </div>

              <div>
                <p className="uppercase text-xs tracking-widest text-gray-300">
                  Visibility
                </p>

                <p className="text-2xl font-semibold">
                  {data.visibility}
                </p>
              </div>

              <div>
                <p className="uppercase text-xs tracking-widest text-gray-300">
                  UV Index
                </p>

                <p className="text-2xl font-semibold text-yellow-300">
                  {data.uv}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between">
            <CloudSun size={120} strokeWidth={1.5} />

            <p className="text-xl">
              Updated {data.updatedAt}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-4 space-y-5">
        {risks.map((risk, idx) => (
          <RiskCard key={idx} risk={risk} />
        ))}
      </div>
    </>
  );
};

export default WeatherHero;