import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onPageChange }) {

if (pages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 py-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm text-gray-700 font-medium">
        Page {page} of {pages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
