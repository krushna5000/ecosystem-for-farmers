import React from "react";
import HeroSection from "../../components/Landing/HeroSection";
import Products from "../../components/Landing/Products";
import Connect from "../../components/Landing/Connect";
import LandingBg from "../../assets/landingBg.png";
import Services from "../../components/Landing/Services";

export default function Landing() {
  return (
    <>
      <section
        id="home"
        className="relative h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${LandingBg})` }}
      >
        <div className="relative z-10 flex flex-col items-start justify-center h-full p-8 md:p-12 max-w-6xl mx-auto text-white">
          <HeroSection />
        </div>
      </section>

      <section id="products">
        <div className="relative z-10 flex flex-col items-start justify-center h-full p-8 md:p-12 max-w-6xl mx-auto ">
          <Products />
        </div>
      </section>

      {/* <section
        id="community"
        className="relative h-screen bg-cover bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${CommunityBg})` }}
      >
        <div className="relative z-10 flex flex-col items-start h-full p-8 md:p-12 max-w-6xl mx-auto text-white">
          <Community />
        </div>
      </section> */}

      <section id="services" className="min-h-screen bg-[#0c1515]">
        <div className="relative z-10 flex flex-col items-start justify-center h-full p-8 md:p-12 max-w-6xl mx-auto">
          <Services />
        </div>
      </section>

      <section id="connect" className="w-full min-h-screen ">
        <div className="relative z-10 flex flex-col w-fit items-start justify-center h-full p-8 md:p-12 max-w-6xl mx-auto">
          <Connect />
        </div>
      </section>
    </>
  );
}
