import {
  Home,
  Camera,
  Sprout,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { setUser } = useAuth();
  const domain = import.meta.env.VITE_DOMAIN;
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/app/dashboard" },
    { name: "Crop AI", icon: Camera, path: "/app/crop-ai" },
    { name: "Crop Life Cycle", icon: Sprout, path: "/app/crop-life-cycle" },
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      console.log("logout");
      const res = await axios.post(
        `${domain}/auth/logout`,
        {},
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }

      setUser(null);
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* MOBILE NAVBAR */}
      <div className="md:hidden bg-[#0c1515] text-white px-4 py-3 shadow-md">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">
            Zeo<span className="text-green-300 font-semibold">Crop</span>
          </h1>

          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation(); // ✅ important
              setOpen(!open);
            }}
            className="bg-white/20 rounded-full p-2"
          >
            <UserCircle size={26} />
          </button>
        </div>

        {/* Icon Navigation */}
        <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0c1515]/95 backdrop-blur-lg border border-white/10 px-10 py-4 shadow-2xl z-50">
          <div className="flex justify-between items-center">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 relative transition ${
                    isActive ? "text-white" : "text-white/60"
                  }`
                }
              >
                <item.icon
                  size={22}
                  className="transition-transform duration-200 active:scale-90"
                />

                {({ isActive }) =>
                  isActive && (
                    <span className="absolute -bottom-1 w-6 h-[3px] rounded-full bg-green-300" />
                  )
                }
              </NavLink>
            ))}
          </div>
        </div>

        {/* Mobile Profile Menu */}
        {open && (
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-md rounded-lg p-1 z-[100000]"
          >
            <button className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition">
              <UserCircle size={16} /> Profile
            </button>
            <button className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition">
              <Settings size={16} /> Settings
            </button>
            <div className="h-[1px] bg-white/20 my-1" />
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>

      {/* DESKTOP NAVBAR */}
      <div className="hidden md:flex bg-[#0c1515] px-6 py-3 items-center relative">
        {/* Logo */}
        <h1 className="text-white text-xl font-bold tracking-wide">
          Zeo<span className="text-green-300 font-semibold">Crop</span>
        </h1>

        {/* Center Dynamic Island */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-full text-sm transition ${
                  isActive
                    ? "bg-white/30 text-white"
                    : "text-white/80 hover:bg-white/20"
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Desktop Profile */}
        <div className="ml-auto relative" ref={menuRef}>
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation(); // ✅ important
              setOpen(!open);
            }}
            className="bg-white/10 cursor-pointer rounded-full p-2 text-white"
          >
            <UserCircle size={28} />
          </button>

          {open && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-md rounded-lg p-1 z-[100000]"
            >
              <button className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition">
                <UserCircle size={16} /> Profile
              </button>

              <button className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition">
                <Settings size={16} /> Settings
              </button>

              <div className="h-px bg-gray-200 my-1" />

              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
