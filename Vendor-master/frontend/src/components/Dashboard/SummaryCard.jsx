import React from "react";

export default function SummaryCard({
  title,
  value,
  icon,
  // Pass accent as a color name (e.g., "indigo", "lime", "rose")
  accentColor = "amber", 
}) {
  // Map colors to specific Tailwind classes for flexibility
  const colors = {
    lime: "from-lime-400/20 to-green-400/20 text-lime-600 ring-lime-500/20",
    indigo: "from-indigo-400/20 to-blue-400/20 text-indigo-600 ring-indigo-500/20",
    rose: "from-rose-400/20 to-red-400/20 text-rose-600 ring-rose-500/20",
    amber: "from-amber-400/20 to-orange-400/20 text-amber-600 ring-amber-500/20",
  };

  const activeColor = colors[accentColor] || colors.lime;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50">
      
      {/* 1. Background Blob Animation */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${activeColor} blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70 opacity-0`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          {/* 2. Modern Typography: Tighter tracking, lighter weight */}
          <p className="text-sm font-medium text-gray-500 transition-colors group-hover:text-gray-700">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 tracking-tight">
            {value ?? "—"}
          </p>
        </div>

        {/* 3. Modern Icon Container: Squircle shape + Soft Ring */}
        {icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br ${activeColor} shadow-sm ring-1 ring-inset backdrop-blur-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* 4. Bottom indicator (Optional modern touch) */}
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live Data
      </div>
    </div>
  );
}