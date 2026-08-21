import React from 'react';
import DashboardLayout from './ProductDashboard/DashboardLayout';
import ProductDetail from './ProductDashboard/ProductDetail';
import ShowProduct from './ProductDashboard/ShowProduct';

import './App.css'; // Keep existing styles if any, but dashboard.css is imported in components

import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<ProductDetail />} />
        <Route path="/add-product" element={<ProductDetail />} />
        <Route path="/products" element={<ShowProduct />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
