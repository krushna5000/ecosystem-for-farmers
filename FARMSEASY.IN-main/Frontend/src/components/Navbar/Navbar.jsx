import React, { useState } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    navigate("/"); // home route
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  return (
    <nav className="absolute w-full z-50 font-sans bg-transparent px-4 md:px-12">
      <div className="max-w-7xl mx-auto md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1
          className="text-2xl text-white font-normal cursor-pointer"
          onClick={() => navigate("/")}
        >
          FarmsEasy
        </h1>

        {/* Desktop Nav + Hiring Button */}
        <div className="hidden md:flex items-center gap-6">
          {/* Nav Links */}
          <ul className="flex space-x-8 text-[#CBFF2E] bg-white/20 backdrop-blur-xs p-2 px-5 rounded-full">
            <li>
              <button
                onClick={() => handleNavClick("home")}
                className="cursor-pointer hover:text-[#b8d404cf] transition-colors duration-300"
              >
                Home
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavClick("products")}
                className="cursor-pointer hover:text-[#b8d404cf] transition-colors duration-300"
              >
                Products
              </button>
            </li>

            <li>
              <Link
                to="/team"
                className="cursor-pointer hover:text-[#b8d404cf] transition-colors duration-300"
              >
                Team
              </Link>
            </li>

            <li>
              <Link
                to="/about-us"
                className="cursor-pointer hover:text-[#b8d404cf] transition-colors duration-300"
              >
                About
              </Link>
            </li>
          </ul>

          {/* Hiring Button */}
          <Link to="/careers">
            <button className="relative cursor-pointer bg-[#CBFF2E] hover:bg-[#b8e829] text-black font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300 overflow-hidden group animate-pulse-glow">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-[#CBFF2E] rounded-full blur-xl opacity-75 animate-pulse"></div>

              {/* Secondary outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#CBFF2E] via-[#a8d926] to-[#CBFF2E] rounded-full blur-lg opacity-60 animate-pulse-slow"></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              {/* Button content */}
              <span className="relative flex items-center gap-2 z-10">
                <Leaf className="w-4 h-4" />
                We're Hiring!
              </span>
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-transparent backdrop-blur-md shadow-lg">
          <ul className="flex flex-col space-y-4 p-6 text-left text-white">
            <li>
              <button
                className="hover:text-green-600 transition-colors cursor-pointer duration-300"
                onClick={() => {
                  handleNavClick("home");
                  setIsOpen(false);
                }}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className="hover:text-green-600 transition-colors cursor-pointer duration-300"
                onClick={() => {
                  handleNavClick("products");
                  setIsOpen(false);
                }}
              >
                Products
              </button>
            </li>
            <li>
              <Link
                to="/team"
                className="hover:text-green-600 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Team
              </Link>
            </li>
            <li>
              <Link
                to="/about-us"
                className="hover:text-green-600 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
            </li>
          </ul>
          <Link to="/careers">
            <button className="relative bg-[#CBFF2E] hover:bg-[#b8e829] text-black font-semibold px-4 py-2 ml-4 rounded-full shadow-lg transition-all duration-300 overflow-hidden group animate-pulse-glow">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-[#CBFF2E] rounded-full blur-xl opacity-75 animate-pulse"></div>

              {/* Secondary outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#CBFF2E] via-[#a8d926] to-[#CBFF2E] rounded-full blur-lg opacity-60 animate-pulse-slow"></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              {/* Button content */}
              <span className="relative flex items-center gap-2 z-10 ">
                <Leaf className="w-4 h-4 " />
                We're Hiring!
              </span>
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
