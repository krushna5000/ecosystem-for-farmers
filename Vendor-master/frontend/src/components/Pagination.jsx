// src/components/common/Pagination.jsx
import React from "react";

export default function Pagination({
  page,
  pages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4  p-4 bg-white  shadow-sm ">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* Page Info */}
        <span className="text-sm text-gray-600 font-medium">
          Page <span className="text-black font-semibold">{page}</span> of{" "}
          <span className="text-black font-semibold">{pages}</span>
        </span>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">

        {/* Prev Button */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition 
            ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-lime-300 hover:bg-lime-400 text-black"
            }`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1)
            .map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                  ${
                    p === page
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-lime-200"
                  }`}
              >
                {p}
              </button>
            ))}
        </div>

        {/* Next Button */}
        <button
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition 
            ${
              page === pages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-lime-300 hover:bg-lime-400 text-black"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}