import React, { useEffect, useState } from "react";
import { Home, Calendar, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = ({ isSidebarOpen = true, setIsSidebarOpen = () => {} }) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const menuItems = [
    { icon: <Home size={22} />, label: "Dashboard", path: "/Dashboard" },
    {
      icon: <Calendar size={22} />,
      label: "Master",
      subItems: [
        { label: "Location Service", path: "/PincodeManager" },
        { label: "Crop Category", path: "/CropCategoryPage" },
        { label: "Crop Stage", path: "/CropStages" },
        { label: "Crop", path: "/Crop" },
        { label: "User", path: "/User" },
      ],
    },
  ];

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    const openMenu = menuItems.find(
      (item) =>
        item.subItems &&
        item.subItems.some((sub) => location.pathname.startsWith(sub.path))
    );
    setOpenSubmenu(openMenu?.label || null);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 border-r border-gray-200 bg-white text-gray-900 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <h1 className="text-lg font-semibold">Super Admin</h1>
          ) : (
            <div className="h-8 w-8 rounded bg-gray-200"></div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map(({ icon, label, path, subItems }) => {
            const isActive =
              location.pathname === path ||
              (subItems && subItems.some((sub) => location.pathname === sub.path));
            const isSubmenuOpen = openSubmenu === label;

            return (
              <div key={label}>
                {/* Parent item */}
                {path ? (
                  <Link to={path}>
                    <div
                      className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                        isActive
                          ? "bg-gray-100 font-medium"
                          : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <span className="mr-3 text-gray-700">{icon}</span>
                      {isSidebarOpen && (
                        <span className="text-sm">{label}</span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                      isActive
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                    onClick={() =>
                      subItems
                        ? setOpenSubmenu((prev) => (prev === label ? null : label))
                        : null
                    }
                  >
                    <span className="mr-3 text-gray-700">{icon}</span>
                    {isSidebarOpen && (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-sm">{label}</span>
                        {subItems && (
                          <ChevronDown
                            size={16}
                            className={`ml-2 transition-transform duration-200 ${
                              isSubmenuOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submenu */}
                {subItems && isSidebarOpen && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isSubmenuOpen ? "max-h-60 mt-1" : "max-h-0"
                    }`}
                  >
                    <div className="ml-6 space-y-1">
                      {subItems.map(({ label: subLabel, path: subPath }) => (
                        <Link to={subPath} key={subLabel}>
                          <div
                            className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                              location.pathname === subPath
                                ? "bg-gray-100 font-medium"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {subLabel}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full p-3 text-center text-xs text-gray-400 border-t border-gray-200">
          {isSidebarOpen ? "© 2025 Admin Panel" : "©"}
        </div>
      </div>
    </>
  );
};
