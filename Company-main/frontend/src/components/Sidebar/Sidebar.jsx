import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Leaf,
  UserCog,
  MapPinned,
  LocateIcon,
  BadgeCheck,
  Package,
  UsersRound,
} from "lucide-react";
import { getCompanyProfile } from "../../api/Company/company.service";

const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  toggleSidebar,
  closeMobileSidebar,
}) => {
  const sidebarRef = useRef(null);
  const floatingRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const data = await getCompanyProfile();

      setCompany(data);
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      to: "/company/dashboard",
    },
    {
      label: "Brand Management",
      icon: <BadgeCheck size={18} />,
      to: "/company/brand-management",
    },

    {
      label: "product Management",
      icon: <Leaf size={18} />,
      subMenu: [
        {
          label: "Catagory",
          to: "/company/product-management/catagory",
        },
        {
          label: "Sub Catagory",
          to: "/company/product-management/subcatagory",
        },
        {
          label: "Product",
          to: "/company/product-management/products",
        },
      ],
    },
    {
      label: "Inventory Management",
      icon: <Package size={18} />,
      to: "/company/inventory-management",
    },
    {
      label: "Lead Management",
      icon: <UsersRound size={18} />,
      to: "/company/lead-management",
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
        <div className="flex flex-col items-center justify-center border-b border-gray-700 pb-4">
          <img
            src={company?.logo_url || "Company"}
            alt={company?.name || "Company"}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 bg-white p-1"
            onError={(e) => {
              e.target.onerror = null;
            }}
          />

          {!isCollapsed && (
            <h2 className="mt-2 text-sm font-semibold text-center">
              {company?.name || "Company"}
            </h2>
          )}
        </div>

        <nav className="flex flex-col mt-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.subMenu ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center w-full py-3 rounded-md text-sm font-medium transition-all cursor-pointer
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
                      ? "max-h-45 opacity-100"
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

              {/* When sidebar is collapsed → floating submenu */}
              {isCollapsed && openMenu === item.label && (
                <div
                  ref={floatingRef}
                  className="absolute left-21 bg-[#0c1515] text-white shadow-lg rounded-md p-2 w-48 z-[999]"
                >
                  {item.subMenu.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-sm 
                          ${isActive ? "bg-gray-800" : "hover:bg-gray-700"}`
                      }
                      onClick={() => {
                        setOpenMenu(null);
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
