// src/components/common/DataTable.jsx
import React, { useState, useEffect } from "react";

export default function DataTable({
  columns,
  data = [],
  loading = false,
  onSelectionChange,
  onDeleteSelected,
}) {
  const [selectedRows, setSelectedRows] = useState([]);

  // Notify parent
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows]);

  // Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data);
    } else {
      setSelectedRows([]);
    }
  };

  // Select single row
  const handleRowSelect = (row) => {
    const exists = selectedRows.some((r) => r.id === row.id);

    if (exists) {
      setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const isSelected = (row) =>
    selectedRows.some((r) => r.id === row.id);

  // ❗ FIXED: DO NOT RESET HERE
  const handleDelete = () => {
    if (onDeleteSelected) {
      onDeleteSelected(selectedRows);
    }
  };

  return (
    <div className="bg-white  shadow overflow-hidden">

      {/* Selected Count */}
      {selectedRows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-gray-100 border-b">
          <span className="text-sm text-gray-700">
            {selectedRows.length} selected
          </span>

          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
          >
            Delete {selectedRows.length} Selected
          </button>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full border-collapse">

          <thead>
            <tr className="bg-lime-300 text-left text-sm md:text-base">

              <th className="px-3 md:px-4 py-3">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    data.length > 0 &&
                    selectedRows.length === data.length
                  }
                />
              </th>

              {columns.map((col, index) => (
                <th key={col.key || index} className="px-3 md:px-4 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center">
                  No entries found.
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="border-t">
                  <td className="px-3 md:px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected(row)}
                      onChange={() => handleRowSelect(row)}
                    />
                  </td>

                  {columns.map((col, colIndex) => (
                    <td
                      key={`${col.key || colIndex}-${row.id}`}
                      className="px-3 md:px-4 py-3"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}