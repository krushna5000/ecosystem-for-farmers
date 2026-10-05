import { CloudSun } from "lucide-react";

const ForecastCard = ({ item }) => {
  return (
    <div
      className={`rounded-[28px] p-6 flex flex-col items-center justify-between min-h-[240px]
      ${
        item.active
          ? "bg-[#073B2A] text-white"
          : "bg-white text-black"
      }`}
    >
      <p className="text-sm font-semibold tracking-wide">
        {item.day}
      </p>

      <CloudSun
        size={42}
        className={
          item.active
            ? "text-white"
            : "text-green-700"
        }
      />

      <div className="text-center">
        <h3 className="text-5xl font-bold">
          {item.temp}
        </h3>

        <p className="text-lg opacity-70">
          {item.low}
        </p>
      </div>

      <div
        className={`px-4 py-2 rounded-full text-sm font-medium
        ${
          item.active
            ? "bg-[#0D5A3E]"
            : "bg-[#EAF7EF] text-[#0A6A3D]"
        }`}
      >
        {item.rain}
      </div>
    </div>
  );
};

export default ForecastCard;