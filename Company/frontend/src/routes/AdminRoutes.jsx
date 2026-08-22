import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import ServiceLoaction from "../pages/ServiceLoaction";
import BrandPage from "../pages/BrandManagement/BrandPage";
import CategoryPage from "../pages/InventoryManagement/Catagory/CategoryPage";
import SubCategoryPage from "../pages/InventoryManagement/SubCategory/SubCategoryPage";
import ProductPage from "../pages/InventoryManagement/Products/ProductPage";
import BrandProductsPage from "../pages/InventoryManagement/Products/BrandProductsPage";
import ProductManagement from "../pages/InventoryManagement/ProductManagement";
import BrandInventoryPage from "../pages/InventoryManagement/Inventory/InventoryPage";
import InventoryPage from "../pages/InventoryManagement/Inventory/InventoryPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import { LeadPage } from "../pages/LeadManagement/LeadPage";

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
        path="/company"
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

        <Route path="product-management" element={<ProductManagement />}>
          <Route path="catagory" element={<CategoryPage />} />
          <Route path="subcatagory" element={<SubCategoryPage />} />
          <Route path="products" element={<ProductPage />} />
        </Route>
        <Route path="inventory-management" element={<InventoryPage />} />
        <Route path="lead-management" element={<LeadPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
