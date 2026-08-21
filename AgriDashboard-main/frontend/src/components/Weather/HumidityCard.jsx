const HumidityCard = ({ humidity }) => {
  return (
    <div className="col-span-4 bg-white rounded-[32px] p-8 relative overflow-hidden">
      
      <h3 className="text-2xl font-bold">
        Humidity Saturation
      </h3>

      <p className="uppercase text-xs tracking-[3px] text-gray-400 mt-2">
        Avg: {humidity.average}% RH
      </p>

      <div className="mt-10">
        
        <h1 className="text-6xl font-bold text-[#0A6A3D] flex items-center gap-3">
          {humidity.value}%

          <span className="text-2xl">
            ↗
          </span>
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        
        <svg
          viewBox="0 0 500 120"
          className="w-full h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C50,60 100,110 150,90 C200,70 250,100 300,70 C350,40 400,90 500,60 L500,120 L0,120 Z"
            fill="#B9DCC5"
          />
        </svg>
      </div>
    </div>
  );
};

export default HumidityCard;