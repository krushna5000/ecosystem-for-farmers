// src/components/DataTable.jsx

import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ⚡ OPTIMIZATION: Memoize the table rows
  // This prevents React from re-rendering the entire DOM node tree for the table body
  // unless the actual row data or column structure changes.
  const renderedRows = useMemo(() => {
    const rows = table.getRowModel().rows;

    if (!rows.length) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="py-14 text-center text-sm text-[#8A9B90]"
          >
            No data available
          </td>
        </tr>
      );
    }

    return rows.map((row) => (
      <tr
        key={row.id}
        className="border-b border-[#EDF2EE] transition-all duration-200 hover:bg-[#FAFCFB]"
      >
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            className="px-6 py-5 text-sm font-medium text-[#102A1A] whitespace-nowrap"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ));
  }, [table.getRowModel().rows, columns.length]); // Only recalculate if rows or columns change

  return (
    <div className="w-full overflow-hidden rounded-[28px] border border-[#E4ECE7] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-[#F7FAF8]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[#E4ECE7]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider text-[#7A8B80]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body - Now rendering the memoized variable */}
          <tbody>{renderedRows}</tbody>
        </table>
      </div>
    </div>
  );
}
