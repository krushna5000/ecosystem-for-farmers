import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
  return (
    <div className="relative w-full h-[100dvh] bg-gray-100 overflow-hidden">
      {/* App Shell */}
      <div className="flex flex-col h-full">
        {/* Top Navbar (Mobile + Desktop handled inside Navbar) */}
        <Navbar />

        {/* Scrollable Content */}
        <main
          className="
            flex-1 overflow-y-auto
            hide-scrollbar
            px-4 md:px-6
            pb-6
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
