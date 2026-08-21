// src/components/common/PageHeader.jsx
import React from "react";

export default function PageHeader({ title, subtitle, buttonText, onButtonClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="md:text-2xl text-xl  font-bold">{title}</h1>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="md:text-md text-xs px-4 py-2 rounded bg-[#BBF451] text-black font-semibold"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
