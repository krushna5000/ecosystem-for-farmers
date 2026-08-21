import {
  LayoutDashboard,
  Tractor,
  Satellite,
  CloudSun,
  Sprout,
  Activity,
  ChartNoAxesCombined,
  FileText,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menus = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Farms",
    icon: Tractor,
    path: "/farms",
  },
  {
    name: "Satellite Insights",
    icon: Satellite,
    path: "/satellite",
  },
  {
    name: "Weather",
    icon: CloudSun,
    path: "/weather",
  },
  {
    name: "Crop AI",
    icon: Sprout,
    path: "/crop-ai",
  },
  {
    name: "Lifecycle",
    icon: Activity,
    path: "/lifecycle",
  },
  {
    name: "Analytics",
    icon: ChartNoAxesCombined,
    path: "/analytics",
  },
  {
    name: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const Sidebar = () => {
  return (
    <div className="w-[275px] bg-[#F5F7F6] border-r border-[#E5E7EB] h-screen flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="px-7 pt-6 pb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#0B5D3B] flex items-center justify-center text-white text-xl">
            🚜
          </div>

          <div>
            <h1 className="text-[20px] font-[700] text-[#111827] leading-none">
              ZeoCrop
            </h1>

            <p className="text-[11px] tracking-[1px] mt-1 text-[#64748B] font-[600]">
              PRECISION AGRICULTURE
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-5 px-4 flex flex-col gap-1">

          {menus.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 h-[48px] px-4 rounded-2xl transition-all duration-200
                  
                  ${
                    isActive
                      ? "bg-[#E6F4EC] text-[#157347]"
                      : "text-[#475569] hover:bg-[#EEF2F3]"
                  }
                  `
                }
              >
                <Icon size={20} strokeWidth={2.3} />

                <span className="text-[16px] font-[500]">
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* BUTTON */}
      <div className="p-5">
        <button
          className="
          w-full
          h-[56px]
          rounded-full
          bg-[#0B5D3B]
          text-white
          text-[18px]
          font-[500]
          shadow-lg
          hover:scale-[1.01]
          transition-all
          "
        >
          + New Analysis
        </button>
      </div>
    </div>
  );
};

export default Sidebar;