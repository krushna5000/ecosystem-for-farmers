// src/components/common/PageHeader.jsx
import React from "react";

export default function PageHeader({ title, subtitle, buttonText, onButtonClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="px-4 py-2 rounded bg-[#CBFF2E] text-black font-semibold cursor-pointer"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
