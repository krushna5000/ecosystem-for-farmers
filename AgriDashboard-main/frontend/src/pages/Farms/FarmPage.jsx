// src/pages/Farm/FarmPage.jsx

import React, { useState, useEffect } from "react";
import { MoreVertical, Leaf } from "lucide-react"; // Using MoreVertical for the 3 dots

import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";

// Mock Data - Replace this with your API fetch later
const initialFarmData = [
  {
    id: "ZC-2024-001",
    name: "Alpha Sector 7",
    location: "Iowa, USA",
    region: "Central Plains",
    area: "1,240.5",
    crop: "Corn",
    ndvi: 0.72,
    health: "STABLE GROWTH",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400",
  },
  {
    id: "ZC-2024-042",
    name: "Bravo Meridian",
    location: "Saskatchewan, CA",
    region: "Northern Prairie",
    area: "856.2",
    crop: "Wheat",
    ndvi: 0.45,
    health: "DISTRESSED",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400",
  },
  {
    id: "ZC-2024-098",
    name: "Echo Basin 9",
    location: "Mato Grosso, BR",
    region: "Tropical Belt",
    area: "3,120.0",
    crop: "Soybean",
    ndvi: 0.88,
    health: "OPTIMAL YIELD",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=400",
  },
  {
    id: "ZC-2024-012",
    name: "Delta Ridge 4",
    location: "Kiev, UA",
    region: "Chernozem Region",
    area: "540.8",
    crop: "Corn",
    ndvi: 0.61,
    health: "MONITORING",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3af2e283fb2?q=80&w=400",
  },
];

// Reusable Health Badge Component
function HealthBadge({ status }) {
  const styles = {
    "STABLE GROWTH": "bg-[#E8F5E9] text-[#2E7D32]",
    DISTRESSED: "bg-[#FFEBEE] text-[#C62828]",
    "OPTIMAL YIELD": "bg-[#E0F2F1] text-[#00897B]", // Brighter green
    MONITORING: "bg-[#FFF8E1] text-[#F57F17]", // Yellow/Brown
  };

  return (
    <div
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-[11px] font-bold tracking-wider
        ${styles[status] || "bg-gray-100 text-gray-800"}
      `}
    >
      {status}
    </div>
  );
}

// Helper to determine NDVI bar color based on score/health
function getNdviColor(score) {
  if (score >= 0.8) return "#00E676"; // Bright green (Optimal)
  if (score >= 0.7) return "#2E7D32"; // Dark green (Stable)
  if (score >= 0.6) return "#8D6E63"; // Brownish (Monitoring)
  return "#D32F2F"; // Red (Distressed)
}

const columns = [
  {
    header: "FARM IDENTITY",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-4 py-2">
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-12 h-12 rounded-full object-cover shadow-sm"
        />
        <div>
          <h3 className="font-bold text-[#102A1A] text-sm">
            {row.original.name}
          </h3>
          <p className="text-xs text-[#8A9B90] mt-0.5">ID: {row.original.id}</p>
        </div>
      </div>
    ),
  },
  {
    header: "PRIMARY LOCATION",
    accessorKey: "location",
    cell: ({ row }) => (
      <div>
        <h3 className="font-bold text-[#102A1A] text-sm">
          {row.original.location}
        </h3>
        <p className="text-xs text-[#8A9B90] mt-0.5">{row.original.region}</p>
      </div>
    ),
  },
  {
    header: "AREA (HA)",
    accessorKey: "area",
    cell: ({ row }) => (
      <span className="font-bold text-[#102A1A] text-sm">
        {row.original.area}
      </span>
    ),
  },
  {
    header: "CROP GENETICS",
    accessorKey: "crop",
    cell: ({ row }) => (
      <div className="inline-flex items-center gap-1.5 bg-[#F4F7F5] px-2.5 py-1.5 rounded-md border border-[#E8ECE9]">
        <Leaf size={14} className="text-[#5C7164]" />
        <span className="text-xs font-bold text-[#3D5045]">
          {row.original.crop}
        </span>
      </div>
    ),
  },
  {
    header: "NDVI SCORE",
    accessorKey: "ndvi",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-16 h-1.5 rounded-full bg-[#E6EEE8] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Number(row.original.ndvi) * 100}%`,
              backgroundColor: getNdviColor(row.original.ndvi),
            }}
          />
        </div>
        <span className="font-bold text-sm text-[#102A1A]">
          {row.original.ndvi}
        </span>
      </div>
    ),
  },
  {
    header: "BIOMETRIC HEALTH",
    accessorKey: "health",
    cell: ({ row }) => <HealthBadge status={row.original.health} />,
  },
  {
    header: "ACTIONS",
    accessorKey: "actions",
    cell: () => (
      <button className="text-[#A1B0A6] hover:text-[#102A1A] transition-colors cursor-pointer p-2">
        <MoreVertical size={18} />
      </button>
    ),
  },
];

export default function FarmPage() {
  const [farmData, setFarmData] = useState(initialFarmData);

  // Example of how you will connect the backend later:
  /*
  useEffect(() => {
    async function fetchFarms() {
      try {
        const response = await fetch('/api/farms');
        const data = await response.json();
        setFarmData(data);
      } catch (error) {
        console.error("Error fetching farms:", error);
      }
    }
    fetchFarms();
  }, []);
  */

  return (
    <div className="p-8 bg-[#FAFCFB] min-h-screen font-sans">
      {/* Header */}
      <PageHeader title="Farms Management" subtitle="ZeoCrop / Active Farms" />

      {/* Top Section */}
      <div className="grid grid-cols-12 gap-6 mb-6 mt-6">
        {/* Filters */}
        <div className="col-span-9 bg-white rounded-3xl shadow-sm border border-[#F0F4F2] p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-[#8A9B90] tracking-wider uppercase mb-2 block">
                Region Filter
              </label>
              <select className="w-full h-12 rounded-xl border border-[#E8ECE9] px-4 text-sm font-bold text-[#102A1A] outline-none bg-white cursor-pointer appearance-none">
                <option>All Global Sectors</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-[#8A9B90] tracking-wider uppercase mb-2 block">
                Crop Type
              </label>
              <select className="w-full h-12 rounded-xl border border-[#E8ECE9] px-4 text-sm font-bold text-[#102A1A] outline-none bg-white cursor-pointer appearance-none">
                <option>All Crops</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-[#8A9B90] tracking-wider uppercase mb-2 block">
                Health Status
              </label>
              <select className="w-full h-12 rounded-xl border border-[#E8ECE9] px-4 text-sm font-bold text-[#102A1A] outline-none bg-white cursor-pointer appearance-none">
                <option>All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="col-span-3 rounded-3xl bg-[#E8F5E9] p-6 text-[#102A1A] relative overflow-hidden flex items-center justify-between border border-[#C8E6C9]">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#2E7D32] mb-1 uppercase">
              Active Analysis
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black">142</h2>
              <span className="text-sm font-bold text-[#8A9B90]">Units</span>
            </div>
          </div>

          {/* Circular Graph Graphic Placeholder */}
          <div className="w-12 h-12 rounded-full border-[3px] border-[#4CAF50] flex items-center justify-center relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#F0F4F2] overflow-hidden">
        <DataTable columns={columns} data={farmData} />
      </div>
    </div>
  );
}
