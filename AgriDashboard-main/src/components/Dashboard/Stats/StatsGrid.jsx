import StatCard from "./StatCard";
import { statsData } from "../../../utils/data/dashboardData.jsx";

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-6 gap-5">

      {statsData.map((item, index) => (
        <StatCard key={index} item={item} />
      ))}

    </div>
  );
};

export default StatsGrid;