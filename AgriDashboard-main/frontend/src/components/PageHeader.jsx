import React from "react";
import { Download, Plus } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  onExport,
  onAdd,
  exportText = "Export Data",
  addText = "Add Farm",
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      
      {/* Left Section */}
      <div>
        <h1 className="text-[34px] leading-tight font-extrabold text-[#102A1A]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm font-medium text-[#5B8A72]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* Export Button */}
        <button
          onClick={onExport}
          className="
            flex items-center gap-2
            px-5 py-3
            rounded-xl
            bg-[#E9EEF6]
            text-[#102A1A]
            font-semibold text-sm
            hover:bg-[#dfe6f0]
            transition-all duration-200
            cursor-pointer
          "
        >
          <Download size={16} />
          {exportText}
        </button>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="
            flex items-center gap-2
            px-5 py-3
            rounded-xl
            bg-[#0F5C3A]
            text-white
            font-semibold text-sm
            hover:bg-[#0c4d31]
            transition-all duration-200
            shadow-sm
            cursor-pointer
          "
        >
          <Plus size={18} />
          {addText}
        </button>
      </div>
    </div>
  );
}