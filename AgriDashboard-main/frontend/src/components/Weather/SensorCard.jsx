import { Wind, Moon } from "lucide-react";

const SensorCard = ({ sensors, moon }) => {
  return (
    <div className="col-span-4 bg-[#EEF3FB] rounded-[32px] p-8">
      
      <h3 className="text-2xl font-black tracking-[3px] mb-8">
        ATMOSPHERIC SENSORS
      </h3>

      <div className="space-y-6">
        
        {sensors.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border-b border-gray-200 pb-4"
          >
            <div className="flex items-center gap-3">
              <Wind size={18} />

              <span>
                {item.title}
              </span>
            </div>

            <span className="font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10">
        
        <h4 className="uppercase text-xs tracking-[4px] text-gray-500 mb-5">
          Moon Phase
        </h4>

        <div className="flex items-center gap-4">
          
          <Moon
            size={42}
            className="text-yellow-700"
          />

          <div>
            <p className="font-bold">
              {moon.phase}
            </p>

            <p className="text-sm text-gray-500">
              Illumination: {moon.illumination}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;