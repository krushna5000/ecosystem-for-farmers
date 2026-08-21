import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import InventoryManagement from "../pages/InventoryManagement/InventoryManagement";
import ServiceLoaction from "../pages/ServiceLoaction";
import BrandPage from "../pages/BrandManagement/BrandPage";
import CategoryPage from "../pages/InventoryManagement/Catagory/CategoryPage";
import SubCategoryPage from "../pages/InventoryManagement/SubCategory/SubCategoryPage";
import ProductPage from "../pages/InventoryManagement/Products/ProductPage";
import BrandProductsPage from "../pages/InventoryManagement/Products/BrandProductsPage";

const AdminRoutes = () => {
  return (
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
        path="/vendor"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
      {/* <Route path="/" element={<Login />} />
      <Route path="/company" element={<AdminLayout />}> */}
         <Route path="dashboard" element={<Dashboard />} />
        <Route path="service-location" element={<ServiceLoaction />} />
        <Route path="brand-management" element={<BrandPage />} />
        <Route
          path="brand-management/:brandId/products"
          element={<BrandProductsPage />}
        />

        <Route path="inventory-management" element={<InventoryManagement />}>
          <Route path="catagory" element={<CategoryPage />} />
          <Route path="subcatagory" element={<SubCategoryPage />} />
          <Route path="products" element={<ProductPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
