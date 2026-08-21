

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";


export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true }); // Prevent back navigation to dashboard
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* <Sidebar isSidebarOpen={isSidebarOpen} />
      <div
        className={`flex-1 transition-all duration-300 bg-gray-100 ${
          isSidebarOpen ? "ml-0 md:ml-64" : "ml-0 md:ml-20"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /> */}
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1  transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="p-4 md:p-6 bg-gray-100 min-h-screen">
          <div className="bg-gradient-to-r from-blue-400 to-green-500 rounded-lg p-6 text-white mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">Welcome back, Super Admin!</h1>
            <p className="mt-1 text-blue-100 text-sm md:text-base">
              Here's what's happening with your dashboard today.
            </p>
          </div>
          {/* <DashboardCards /> */}
         
        </main>
      </div>
    </div>
  );
};
