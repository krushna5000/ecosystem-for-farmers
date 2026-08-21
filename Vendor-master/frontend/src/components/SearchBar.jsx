// src/components/common/SearchBar.jsx
import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <input
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-2 w-64"
      />
    </div>
  );
}
