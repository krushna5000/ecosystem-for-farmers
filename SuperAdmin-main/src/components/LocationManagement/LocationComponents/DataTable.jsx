import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";
import { useMemo, useState } from "react";
import axios from "axios";
import { domain } from "../../../utils/domain";
import toast from "react-hot-toast";

const DataTable = ({
  columns = [],
  data = [],
  actions,
  showToggle = true,
  fetchData,
  api_name,
}) => {
  const [selectedData, setSelectedData] = useState([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const filteredData = useMemo(() => {
    let tempData = [...data];

    // Search
    if (search.trim()) {
      tempData = tempData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }

    // Sorting
    if (sortConfig.key) {
      tempData.sort((a, b) => {
        const valA = String(a[sortConfig.key] || "").toLowerCase();
        const valB = String(b[sortConfig.key] || "").toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return tempData;
  }, [search, data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const pageData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelect = (id) => {
    setSelectedData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const ids = pageData.map((row) => row.id || row[columns[0].key]);

    if (selectedData.length === ids.length) {
      setSelectedData([]);
    } else {
      setSelectedData(ids);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.delete(
        `${domain}/location/${api_name}/bulk-delete`,
        {
          data: { ids: selectedData },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setSelectedData([]);
        await fetchData();
        toast.error(" Data Deleted Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data || err);
    }
  };

  return (
    <div className="shadow-lg rounded-lg border border-gray-200 p-4 bg-white">
      {/* top controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="space-x-4">
          <select
            className="border px-3 py-2 cursor-pointer rounded-md w-32"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num} rows
              </option>
            ))}
          </select>

          {selectedData.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
            >
              Delete ({selectedData.length})
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded-md w-full sm:w-1/3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#CBFF2E] text-black">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  onChange={handleSelectAll}
                  checked={
                    pageData.length > 0 &&
                    selectedData.length === pageData.length
                  }
                />
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-4 text-left font-semibold cursor-pointer select-none"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="ml-2">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}

              {actions && (
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  No data found
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const id = row.id || row[columns[0].key];

                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={selectedData.includes(id)}
                        onChange={() => handleSelect(id)}
                      />
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4">
                        {row[col.key] ?? "-"}
                      </td>
                    ))}

                    {actions && (
                      <td className="py-2 px-4 flex gap-3 items-center justify-center">
                        <button
                          onClick={() => actions.onEdit(row)}
                          className="p-2 bg-blue-100 cursor-pointer text-blue-500 hover:text-blue-700 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => actions.onDelete(id)}
                          className="p-2 bg-red-100 cursor-pointer text-red-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {showToggle && (
                          <ToggleSwitch
                            checked={row.is_active}
                            onChange={() => actions.onToggle(id, row.is_active)}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border rounded disabled:opacity-50 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm">
          Page <strong>{currentPage}</strong> of{" "}
          <strong>{totalPages || 1}</strong>
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 border rounded disabled:opacity-50 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DataTable;
