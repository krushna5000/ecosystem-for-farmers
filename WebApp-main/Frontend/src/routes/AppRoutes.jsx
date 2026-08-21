import Layout from "../layout/Layout";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy imports
const CLSM = lazy(() => import("../pages/CLSM"));
const Login = lazy(() => import("../pages/Login"));
const CropAI = lazy(() => import("../pages/CropAI"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const CropManagement = lazy(() => import("../pages/CropManagement"));
const FarmManagement = lazy(() => import("../pages/FarmManagement"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="text-white p-5">Loading...</div>}>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="crop-ai" element={<CropAI />} />
          <Route path="crop-life-cycle" element={<CLSM />} />
          <Route path="add-crop" element={<CropManagement />} />
          <Route path="add-farm" element={<FarmManagement />} />

          {/* wrong path under /app */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* unknown global route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
