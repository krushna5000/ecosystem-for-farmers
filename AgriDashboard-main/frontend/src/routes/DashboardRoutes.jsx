import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Layout from "../layout/Layout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Weather from "../pages/Weather";
import Setting from "../pages/Setting";
import SatelliteInsights from "../pages/SatelliteInsights";
import CropAI from "../pages/CropAI";
import LifeCycle from "../pages/Lifecycle";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Lifecycle from "../pages/Lifecycle";
import FarmPage from "../pages/Farms/FarmPage";

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farms" element={<FarmPage />} />
        <Route path="/Weather" element={<Weather />} />
        <Route path="/satellite" element={<SatelliteInsights />} />
        <Route path="/crop-ai" element={<CropAI />} />
        <Route path="/lifecycle" element={<LifeCycle />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />

                  <Route path="/Settings" element={<Setting />} />
                  <Route path="/Lifecycle" element={<Lifecycle />} />

      </Route>
    </Routes>
  );
};

export default DashboardRoutes;
