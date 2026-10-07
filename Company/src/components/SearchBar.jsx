import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    /* sm:w-auto allows it to shrink back to its cap on larger screens */
    <div className="relative mb-4 flex w-full items-center sm:w-auto">
      
      {/* Visual Icon - Absolutely positioned within the relative parent */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg 
          className="h-4 w-4 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search records..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        /* pl-10: Leaves room for the icon.
           text-base: Prevents iOS from auto-zooming on focus (happens if font-size < 16px).
        */
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-base placeholder-gray-400 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#CBFF2E] sm:w-64 md:w-80 lg:w-96 sm:text-sm"
      />
    </div>
  );
}