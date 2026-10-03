
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

const Layout = () => {
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden max-w-full">

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        toggleSidebar={toggleSidebar}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      <main
        className={`flex-1 flex flex-col bg-gray-100 md:rounded-t-2xl text-black max-w-full min-h-screen transition-all duration-300 
          ${isCollapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
        <Navbar toggleSidebar={toggleSidebar} />

         <div className="flex-1 p-4 md:p-10 pt-4 overflow-y-auto max-w-full">

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
