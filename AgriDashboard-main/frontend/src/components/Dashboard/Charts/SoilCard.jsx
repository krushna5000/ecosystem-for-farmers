import { soilData } from "../../../utils/data/dashboardData.jsx";

const SoilCard = () => {
  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-[28px] font-[800] text-[#111827]">
            Soil Moisture vs. Precipitation
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            IoT Sensor telemetry correlation analysis
          </p>
        </div>

        <button className="bg-[#F1F5F9] px-4 py-2 rounded-xl text-sm font-semibold">
          LAST 30 DAYS
        </button>
      </div>

      {/* PROGRESS */}
      <div className="mt-12 space-y-8">

        {soilData.map((item, index) => (
          <div key={index}>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">
                {item.label}
              </span>

              <span className="text-sm font-semibold">
                {item.value}
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-[#E2E8F0] overflow-hidden">

              <div
                className={`h-full rounded-full ${item.color}`}
                style={{
                  width: item.width,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="grid grid-cols-2 mt-16">

        <div className="text-center">

          <h2 className="text-[36px] font-[800] text-[#111827]">
            0.4%
          </h2>

          <p className="text-sm text-gray-500 tracking-[4px]">
            EFFICIENCY
          </p>
        </div>

        <div className="text-center">

          <h2 className="text-[36px] font-[800] text-[#15803D]">
            Optimal
          </h2>

          <p className="text-sm text-gray-500 tracking-[4px]">
            SATURATION
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoilCard;