import { Settings } from "lucide-react";
import ToggleRow from "./ToggleRow";

const DataAlertsCard = ({ alerts, onToggle }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Settings size={24} className="text-[#087333]" />

        <h2 className="text-2xl font-bold">
          Data & Alerts
        </h2>
      </div>

      <div className="space-y-10">
        {alerts.map((item) => (
          <ToggleRow
            key={item.id}
            item={item}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default DataAlertsCard;