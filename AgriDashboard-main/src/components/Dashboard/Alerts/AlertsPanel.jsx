import AlertCard from "./AlertCard";
import { alertsData } from "../../../utils/data/dashboardData.jsx";

const AlertsPanel = () => {
  return (
    <div className="bg-white rounded-[30px] p-6 shadow-sm h-full flex flex-col">

      <div className="flex items-center justify-between">

        <h2 className="text-[32px] font-[800]">
          Live Alerts
        </h2>

        <div className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
          AI DETECTED
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 flex-1">

        {alertsData.map((item, index) => (
          <AlertCard key={index} item={item} />
        ))}

      </div>

      <button
        className="
        mt-6
        h-[58px]
        rounded-2xl
        bg-[#CDEEDB]
        text-[#0B5D3B]
        font-[700]
        "
      >
        View All Logs
      </button>
    </div>
  );
};

export default AlertsPanel;