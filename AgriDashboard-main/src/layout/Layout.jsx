import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex flex-col flex-1">
        
        {/* Navbar */}
        <Navbar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 custom-scroll">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Layout;