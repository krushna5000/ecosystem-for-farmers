import axios from "axios";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { domain } from "../../utils/domain";

export default function AdminTable({
  admins,
  onEditClick,
  onDeleteClick,
  fetchAdmins,
}) {
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Filter crops based on search
  const filteredAdmins = useMemo(() => {
    if (!Array.isArray(admins)) return [];

    let temp = admins.filter((admin) => {
      const s = search.toLowerCase();
      return (
        admin.name?.toLowerCase().includes(s) ||
        admin.email?.toLowerCase().includes(s)
      );
    });

    // Apply sorting
    if (sortConfig.key) {
      temp.sort((a, b) => {
        const valA = (a[sortConfig.key] || "").toLowerCase();
        const valB = (b[sortConfig.key] || "").toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return temp;
  }, [search, admins, sortConfig]);

  const handleSort = (key) => {
    setCurrentPage(1);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAdmins = filteredAdmins.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSelect = (id) => {
    setSelectedAdmins((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const ids = paginatedAdmins.map((admin) => admin.id);

    if (selectedAdmins.length === ids.length) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(ids);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.delete(`${domain}/bulk-delete`, {
        data: { ids: selectedAdmins },
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedAdmins([]);
        await fetchAdmins(); // refresh table
      }
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <>
      <div className="shadow-lg rounded-lg border border-gray-200 p-4 bg-white">
        {/* Search + Row Selector */}
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
            {selectedAdmins.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="mb-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Delete ({selectedAdmins.length})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md w-full sm:w-60"
          />
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-[#cbff2e] text-grey-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">
                  <input
                    className="cursor-pointer"
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      paginatedAdmins.length > 0 &&
                      selectedAdmins.length === paginatedAdmins.length
                    }
                  />
                </th>
                <th className="px-4 py-3">ID</th>

                <th
                  className="py-3 px-4 text-left font-semibold cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  Name
                  {sortConfig.key === "name" && (
                    <span className="ml-2">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAdmins === undefined ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    <div className="flex justify-center items-center gap-2 text-blue-500">
                      <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                      Loading admins...
                    </div>
                  </td>
                </tr>
              ) : paginatedAdmins && paginatedAdmins.length > 0 ? (
                paginatedAdmins.map((admin, index) => (
                  <tr key={admin.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        checked={selectedAdmins.includes(admin.id)}
                        onChange={() => handleSelect(admin.id)}
                      />
                    </td>
                    <td className="px-4 py-2">{admin.id}</td>
                    <td className="px-4 py-2">{admin.name}</td>
                    <td className="px-4 py-2">{admin.email}</td>
                    <td className="px-4 py-2 flex justify-center gap-3">
                      <button
                        onClick={() => onEditClick(admin)}
                        className="p-2 bg-blue-100 cursor-pointer text-blue-500 hover:text-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteClick(admin)}
                        className="p-2 bg-red-100 cursor-pointer text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-gray-600 font-semibold"
                  >
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* pageination controls */}
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
    </>
  );
}
