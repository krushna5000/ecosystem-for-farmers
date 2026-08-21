

import React from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { Footer } from "../../Components/Footer";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Fullscreen Hero Section with gradient background */}
      <div className="relative w-full h-screen flex items-center justify-center text-white bg-gradient-to-br from-green-300 via-emerald-200 to-teal-800 overflow-hidden">
        
        {/* Central Content */}
        <div className="text-center max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
            SuperAdmin Access Portal
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-green-100 leading-relaxed max-w-xl mx-auto drop-shadow-md">
            Seamlessly manage plant data, system alerts, and user reports with ease.
          </p>

          <button
            onClick={() => navigate("/Login")}
            className="mt-8 px-14 py-4 rounded-full bg-white text-emerald-700 font-semibold shadow-lg hover:bg-emerald-100 transition transform hover:scale-105"
            aria-label="Get Started"
          >
            Get Started
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};
