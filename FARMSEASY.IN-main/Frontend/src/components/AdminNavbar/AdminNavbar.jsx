// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, UserCircle2, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminNavbar = ({ toggleSidebar }) => {
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------- LOGOUT HANDLER --------
  const handleLogout = async () => {
    try {
      await axios.post(
      `${import.meta.env.VITE_API_URL}/vendor/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout API failed", err);
      // still proceed to logout locally
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

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
            <div className="absolute right-0 mt-4 w-40 bg-white border border-gray-200 shadow-lg z-50 rounded">
              <p className="text-[10px] p-2 text-gray-500 font-semibold">
                Welcome to Websit Admin Dashboard
              </p>
              <ul className="text-sm text-gray-700">
                <li className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <UserCircle2 size={18} />
                  Profile
                </li>
                <li className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Settings size={18} />
                  Settings
                </li>
                <li
                  onClick={handleLogout}
                  className="flex gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                >
                  <LogOut size={18} />
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

export default AdminNavbar;
