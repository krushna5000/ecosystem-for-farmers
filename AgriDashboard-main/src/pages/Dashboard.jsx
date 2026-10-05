import StatsGrid from "../components/Dashboard/Stats/StatsGrid";
import MapSection from "../components/Dashboard/Map/MapSection";
import AlertsPanel from "../components/Dashboard/Alerts/AlertsPanel";
import NDVIChart from "../components/Dashboard/Charts/NDVIChart";
import SoilCard from "../components/Dashboard/Charts/SoilCard";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* STATS */}
      <StatsGrid />
    
      {/* MAP + ALERTS */}
      <div className="grid grid-cols-12 gap-6">

        {/* MAP */}
        <div className="col-span-8">
          <MapSection />
        </div>

        {/* ALERTS */}
        <div className="col-span-4">
          <AlertsPanel />
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* NDVI CHART */}
        <NDVIChart />

        {/* SOIL CARD */}
        <SoilCard />

      </div>
    </div>
  );
};

export default Dashboard;