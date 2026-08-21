import React, { useEffect, useState } from "react";
import { Package, Tag, Layers } from "lucide-react";
import { getDashboardSummary } from "../../api/Dashboard/dashboard.service";

// Internal reusable card component for perfect alignment
const StatCard = ({ title, value, subtext, icon: Icon, isFeatured }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
      isFeatured
        ?  "bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200"
        : "bg-white border border-gray-100 text-gray-900 shadow-sm"
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-sm font-medium ${isFeatured ? "text-indigo-100" : "text-gray-500"}`}>
          {title}
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight">{value ?? "0"}</h3>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          isFeatured ? "bg-white/20 text-white" : "bg-gray-50 text-indigo-600"
        }`}
      >
        <Icon size={22} />
      </div>
    </div>

    {/* Footer Text */}
    <div className="mt-4 flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${isFeatured ? "bg-green-400" : "bg-emerald-500 animate-pulse"}`} />
      <span className={`text-xs font-medium ${isFeatured ? "text-indigo-100" : "text-gray-400"}`}>
        {subtext}
      </span>
    </div>

    {/* Decorative blur for the featured card */}
    {isFeatured && (
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />
    )}
  </div>
);

export default function SummaryCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardSummary();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  // Fallback if API fails
  if (!stats) return null;

  return (
    // THE FIX: Strict 3-column grid
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      
      {/* Card 1: Products (Featured) */}
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        subtext="Active Inventory"
        icon={Package}
        isFeatured={true}
      />

      {/* Card 2: Brands */}
      <StatCard
        title="Total Brands"
        value={stats.totalBrands}
        subtext="Verified Brands"
        icon={Tag}
      />

      {/* Card 3: Categories */}
      <StatCard
        title="Total Categories"
        value={stats.totalCategories}
        subtext="Inventory Types"
        icon={Layers}
      />
    </div>
  );
}