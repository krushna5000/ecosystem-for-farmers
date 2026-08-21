import ForecastCard from "./ForecastCard";

const ForecastSection = ({ forecast }) => {
  return (
    <div className="mt-10">
      
      <div className="flex items-center justify-between mb-6">
        
        <h2 className="text-4xl font-bold">
          7-Day Biological Forecast
        </h2>

        <div className="flex bg-white rounded-full p-1 shadow-sm">
          
          <button className="px-5 py-2 rounded-full bg-[#B9EBCB] text-[#065F46] font-semibold">
            Weekly
          </button>

          <button className="px-5 py-2 rounded-full text-gray-500">
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-5">
        
        {forecast.map((item, idx) => (
          <ForecastCard
            key={idx}
            item={item}
          />
        ))}
      </div>
    </div>
  );
};

export default ForecastSection;