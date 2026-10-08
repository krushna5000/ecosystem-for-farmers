import React from "react";

const Card = ({ title, points }) => (
  <div className="bg-[#0b1408] p-6 rounded-xl border border-white/5 hover:border-[#CBFF2E]/30 transition">
    <h3 className="font-semibold mb-4 text-white">{title}</h3>
    <ul className="space-y-3">
      {points.map((p, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="w-2 h-2 bg-[#CBFF2E] rounded-full mt-2"></span>
          <p className="text-gray-400 text-sm leading-relaxed">{p}</p>
        </li>
      ))}
    </ul>
  </div>
);

export default function AboutUs() {
  return (
    <div className="bg-[#071005] text-white min-h-screen font-sans">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 md:px-16">
        <p className="text-[#CBFF2E] text-xs tracking-widest mb-4">
          ABOUT US
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          About FarmsEasy
        </h1>
        <p className="text-gray-400 text-lg max-w-4xl leading-relaxed">
          FarmsEasy is a next-generation AgriTech platform built to transform Indian agriculture through a unified, technology-driven ecosystem. We provide a comprehensive 360-degree solution that connects farmers, agribusinesses, and institutions on a single platform — simplifying farming, improving productivity, and increasing profitability.
        </p>
      </section>

      {/* Problem Statement */}
      <section className="px-6 md:px-16 mb-16">
        <div className="bg-[#0e1a0a] p-8 rounded-2xl border border-white/5">
          <p className="text-gray-400 leading-relaxed">
            India’s agriculture sector faces major challenges such as fragmented supply chains, limited access to quality inputs, and lack of reliable, real-time information. FarmsEasy bridges this gap by combining AI-powered insights, marketplace access, and data-driven decision-making tools into one seamless experience.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-16 mb-16">
        <div className="bg-[#0e1a0a] p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl text-[#CBFF2E] mb-4">Our Mission</h2>
          <p className="text-gray-400">
            To democratize agricultural technology and make farming profitable, sustainable, and accessible for millions of Indian farmers.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 md:px-16 mb-16">
        <h2 className="text-xl text-[#CBFF2E] mb-6">What We Do</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="AI-Powered Crop Management"
            points={[
              "Detect crop diseases",
              "Lifecycle-based recommendations",
              "Weather-based advisory",
            ]}
          />

          <Card
            title="Integrated Marketplace"
            points={[
              "Connect directly with suppliers",
              "Access quality inputs",
              "Fair pricing without intermediaries",
            ]}
          />

          <Card
            title="SaaS for Agribusiness"
            points={[
              "Supply chain optimization",
              "Advanced analytics",
              "Operational efficiency tools",
            ]}
          />

          <Card
            title="Government & Advisory"
            points={[
              "Policy decision support",
              "Subsidy insights",
              "Agricultural planning",
            ]}
          />
        </div>
      </section>

      {/* Differentiator */}
      <section className="px-6 md:px-16 mb-16">
        <h2 className="text-xl text-[#CBFF2E] mb-6">What Makes Us Different</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "One App. Complete Ecosystem",
            "Free for Farmers",
            "AI-First Approach",
            "Built for India (multilingual, mobile-first, low-connectivity support)",
          ].map((item, i) => (
            <div key={i} className="bg-[#0b1408] p-6 rounded-xl border border-white/5">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-[#CBFF2E] rounded-full mt-2"></span>
                <p className="text-gray-400 text-sm">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 md:px-16 pb-20">
        <div className="bg-[#CBFF2E] text-black p-10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="mb-4">
            We envision a future where every farmer has access to the tools, knowledge, and market connections needed to thrive in a modern agricultural ecosystem.
          </p>
          <p className="text-sm">
            FarmsEasy aims to become the backbone of India’s digital agriculture revolution — empowering farmers while enabling businesses and governments to make smarter, data-driven decisions.
          </p>
        </div>
      </section>
    </div>
  );
}