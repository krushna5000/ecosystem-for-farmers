import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Leaf,
  Building,
  Users,
} from "lucide-react";

const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  toggleSidebar,
  closeMobileSidebar,
}) => {
  const sidebarRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    {
      label: "Company Management",
      icon: <Building size={18} />,
      to: "/admin/company-management",
    },
    {
      label: "Vendor Management",
      icon: <Users size={18} />,
      to: "/admin/vendor-management",
    },
  ];

  const toggleMenu = (label) =>
    setOpenMenu((prev) => (prev === label ? null : label));

  // outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        closeMobileSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, closeMobileSidebar]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-[#0c1515] text-gray-200 flex flex-col p-4 z-50 transition-all duration-300
          ${isCollapsed ? "w-20" : "w-64"}
          ${
            isMobileOpen ? "w-64 translate-x-0" : "-translate-x-full"
          } md:translate-x-0
        `}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <span className="text-xl font-bold">
            {isCollapsed ? "🌱" : "Admin"}
          </span>
        </div>

        <nav className="flex flex-col mt-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.subMenu ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center w-full py-3 rounded-md text-sm font-medium transition-all
                            ${
                              isCollapsed
                                ? "justify-center px-0"
                                : "justify-between px-3"
                            }
                            ${
                              openMenu === item.label
                                ? "bg-gray-800 text-white"
                                : "hover:bg-gray-800 text-white"
                            }
                          `}
                >
                  <div className="flex items-center justify-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed &&
                    (openMenu === item.label ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `flex items-center 
                            ${
                              isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                            } 
                            py-3 rounded-md text-sm font-medium transition-all 
                            ${
                              isActive
                                ? "bg-gray-800 text-white"
                                : "hover:bg-gray-800 hover:text-white"
                            }`}
                  onClick={() => {
                    setOpenMenu(null);
                    if (window.innerWidth < 768) closeMobileSidebar();
                  }}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )}

              {/* Submenu */}
              {!isCollapsed && item.subMenu && (
                <div
                  className={`ml-8 mt-1 flex flex-col space-y-1 overflow-hidden transition-all duration-300 ${
                    openMenu === item.label
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.subMenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `px-3 py-1.5 rounded-md text-sm transition-all ${
                          isActive
                            ? "bg-gray-800 text-white"
                            : "hover:bg-gray-700 text-gray-300"
                        }`
                      }
                      onClick={() => {
                        if (window.innerWidth < 768) closeMobileSidebar();
                      }}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
