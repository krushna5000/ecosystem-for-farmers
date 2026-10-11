import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import CropManagement from "../pages/CropManagement";
import AddCrop from "../components/Crop Management/AddCrop";
import CropCategory from "../components/Crop Management/CropCategory";
import CropStage from "../components/Crop Management/CropStage";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

// Location management
import LocationManagement from "../pages/LocationManagement";
import StateManagement from "../components/LocationManagement/StateManagement";
import DistrictManagement from "../components/LocationManagement/DistrictManagement";
import CityManagement from "../components/LocationManagement/CityManagement";
import VillageManagement from "../components/LocationManagement/VillageManagement";
import PincodeManagement from "../components/LocationManagement/PincodeManagement";
import { AuthProvider } from "../context/AuthContext";

const AdminRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin-management" element={<UserManagement />} />
          <Route path="crop-management" element={<CropManagement />}>
            <Route path="add-crop" element={<AddCrop />} />
            <Route path="crop-category" element={<CropCategory />} />
            <Route path="crop-stage" element={<CropStage />} />
          </Route>
          <Route path="location-management" element={<LocationManagement />}>
            <Route path="add-state" element={<StateManagement />} />
            <Route path="add-district" element={<DistrictManagement />} />
            <Route path="add-city" element={<CityManagement />} />
            <Route path="add-village" element={<VillageManagement />} />
            <Route path="add-pincode" element={<PincodeManagement />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default AdminRoutes;
