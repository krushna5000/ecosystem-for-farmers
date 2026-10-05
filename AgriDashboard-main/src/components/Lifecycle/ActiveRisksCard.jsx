import { AlertTriangle } from "lucide-react";

const ActiveRisksCard = ({ risks, growthTrend }) => {
  return (
    <div className="col-span-6 bg-[#F1F5FB] rounded-[28px] p-6">
      <h3 className="flex items-center gap-2 font-bold mb-5">
        <AlertTriangle size={18} className="text-red-500" />
        Active Risks
      </h3>

      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div
            key={index}
            className="bg-white rounded-xl px-4 py-3 flex justify-between text-sm"
          >
            <span>{risk.label}</span>

            <span
              className={`font-bold ${
                risk.type === "danger"
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {risk.value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 mt-6 pt-6">
        <h4 className="text-xs font-bold tracking-[2px] mb-4">
          NDVI GROWTH TREND
        </h4>

        <div className="flex items-end gap-2 h-[90px]">
          {growthTrend.map((value, index) => (
            <div
              key={index}
              style={{ height: `${value}px` }}
              className={`flex-1 rounded-t-sm ${
                index >= growthTrend.length - 2
                  ? "bg-[#087333]"
                  : "bg-[#9AC7B0]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveRisksCard;