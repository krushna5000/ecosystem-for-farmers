// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      // For mobile
      setIsMobileOpen((prev) => !prev);
    } else {
      // For desktop
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex bg-[#0c1515] md:pt-2 md:pr-2 text-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        toggleSidebar={toggleSidebar}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Main Area */}
      <main
        className={`flex-1 flex flex-col bg-gray-100 md:rounded-t-2xl text-black max-w-full min-h-screen transition-all duration-300 
          ${isCollapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-10 pt-4 hide-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
