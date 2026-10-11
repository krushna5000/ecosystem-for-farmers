import { Plus } from "lucide-react";
import React from "react";

export default function AdminHeader({ onCreateClick }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-sm text-gray-500">
            Manage or Create all Admin accounts
          </p>
        </div>

        {/* onclick will popup Create Admin Page */}
        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 cursor-pointer bg-[#cbff2e] hover:bg-[#baff00] transition-all font-semibold text-gray-900 py-2 px-4 rounded-md shadow-md active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Create Admin
        </button>
      </div>
    </>
  );
}
