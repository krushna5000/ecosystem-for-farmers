import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Leaf,
  MapPinned,
  BadgeCheck,
} from "lucide-react";

const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  closeMobileSidebar,
}) => {

  const sidebarRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      to: "/vendor/dashboard",
    },
    {
      label: "Brand Management",
      icon: <BadgeCheck size={18} />,
      to: "/vendor/brand-management",
    },
    {
      label: "Inventory Management",
      icon: <Leaf size={18} />,
      subMenu: [
        {
          label: "Category",
          to: "/vendor/inventory-management/catagory",
        },
        {
          label: "Sub Category",
          to: "/vendor/inventory-management/subcatagory",
        },
        {
          label: "Product",
          to: "/vendor/inventory-management/products",
        },
      ],
    },
    {
      label: "Service Location",
      icon: <MapPinned size={18} />,
      to: "/vendor/service-location",
    },
  ];

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  /* Close mobile sidebar on outside click */
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
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-[#0c1515] text-gray-200 flex flex-col p-4 z-50 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <span className="text-xl font-bold">
            {isCollapsed ? "🌱" : "Vendor"}
          </span>
        </div>

        <nav className="flex flex-col mt-4 space-y-2">

          {menuItems.map((item) => (

            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => isCollapsed && item.subMenu && setOpenMenu(item.label)}
            
            >

              {/* MAIN MENU */}
              {item.subMenu ? (
                <button
                  onClick={() => !isCollapsed && toggleMenu(item.label)}
                  className={`flex items-center w-full py-3 rounded-md text-sm font-medium transition-all
                  ${isCollapsed ? "justify-center px-0" : "justify-between px-3"}
                  ${
                    openMenu === item.label
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 justify-center">
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
                  className={({ isActive }) =>
                    `flex items-center py-3 rounded-md text-sm font-medium transition-all
                    ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"}
                    ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-800 hover:text-white"
                    }`
                  }
                  onClick={() => {
                    setOpenMenu(null);
                    if (window.innerWidth < 768) closeMobileSidebar();
                  }}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )}

              {/* EXPANDED SUBMENU */}
              {!isCollapsed && item.subMenu && (
                <div
                  className={`ml-8 mt-1 flex flex-col space-y-1 overflow-hidden transition-all duration-300
                  ${
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
                        `px-3 py-2 rounded-md text-sm transition-all
                        ${
                          isActive
                            ? "bg-gray-800 text-white"
                            : "hover:bg-gray-700 text-gray-300"
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* FLOATING SUBMENU */}
              {isCollapsed && item.subMenu && openMenu === item.label && (
                <div className="absolute left-full top-0 ml-2 bg-[#0c1515] border border-gray-700 text-white shadow-xl rounded-md p-2 w-48 z-[999]">
                  {item.subMenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-sm
                        ${
                          isActive
                            ? "bg-gray-800"
                            : "hover:bg-gray-700"
                        }`
                      }
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