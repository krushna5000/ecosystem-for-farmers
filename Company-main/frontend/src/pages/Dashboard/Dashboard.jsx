import React from "react";
import SummaryCards from "../../components/Dashboard/SummaryCards";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import QuickActions from "../../components/Dashboard/QuickActions";
import RecentProducts from "../../components/Dashboard/RecentProducts";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-10">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3de081] text-white shadow-lg shadow-indigo-600/20">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm font-medium text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">

        {/* --- LEFT COLUMN (Metrics + Product Table) --- */}
        <div className="xl:col-span-8 space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between h-7">
               <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
            </div>
            <SummaryCards />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between h-7">
               <h2 className="text-lg font-semibold text-gray-900">New Arrivals</h2>
            </div>
            <RecentProducts />
          </section>
        </div>

        {/* --- RIGHT COLUMN (Sticky Sidebar: Actions + Activity) --- */}
        <div className="xl:col-span-4 sticky top-6 space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between h-7">
               <h2 className="text-lg font-semibold text-gray-900">Shortcuts</h2>
            </div>
            <QuickActions />
          </section>

          {/* Activity Feed Enabled */}
          <section>
            <div className="mb-4 flex items-center justify-between h-7">
               <h2 className="text-lg font-semibold text-gray-900">Latest Updates</h2>
            </div>
            <RecentActivity />
          </section>
        </div>

      </div>
    </div>
  );
}