// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, UserCircle2, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as companyService from "../../api/Company/company.service";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full flex items-center justify-between md:rounded-t-2xl bg-white shadow-md md:px-8 px-4 py-3 sticky top-0 z-40">
      <button
        onClick={toggleSidebar}
        className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4">
        <button className="text-gray-700 cursor-pointer hover:text-gray-900 transition">
          <Bell size={22} />
        </button>

        {/* Profile Menu */}
        <div className="relative" ref={menuRef}>
          <UserCircle2
            onClick={() => setOpen(!open)}
            size={28}
            className="text-gray-700 cursor-pointer hover:text-gray-900"
          />

          {open && (
            <div className="absolute right-0 mt-4 w-32 bg-white border border-gray-200 shadow-lg z-50">
              <p className="text-[10px] p-2 text-gray-500 font-semibold">
                Welcome to Company Dashboard
              </p>
              <ul className="text-sm text-gray-700">
                <li className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <UserCircle2 size={20} />
                  Profile
                </li>
                <li className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Settings size={20} />
                  Settings
                </li>
                <li
                  onClick={async () => {
                    try {
                      await companyService.logoutCompany();
                    } catch (err) {
                      console.error("Logout failed", err);
                    } finally {
                      setOpen(false);
                      navigate("/");
                    }
                  }}
                  className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                >
                  <LogOut size={20} />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
