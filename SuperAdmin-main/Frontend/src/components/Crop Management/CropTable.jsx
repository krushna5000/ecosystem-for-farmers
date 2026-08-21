import { useState, useMemo } from "react";
import { Pencil, Trash2, View, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { domain } from "../../utils/domain";
import toast from "react-hot-toast";

export default function CropTable({
  crops = [],
  onEditClick,
  onDeleteClick,
  onViewClick,
  fetchCrops,
}) {
  const [search, setSearch] = useState("");
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter crops based on search
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const s = search.toLowerCase();
      return (
        crop.crop_name?.toLowerCase().includes(s) ||
        crop.category_name?.toLowerCase().includes(s)
      );
    });
  }, [search, crops]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCrops.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedCrops = filteredCrops.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSelect = (id) => {
    setSelectedCrops((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const ids = paginatedCrops.map((admin) => admin.id);

    if (selectedCrops.length === ids.length) {
      setSelectedCrops([]);
    } else {
      setSelectedCrops(ids);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.delete(`${domain}/crops/bulk-delete`, {
        data: { ids: selectedCrops },
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedCrops([]);
        await fetchCrops();
        toast.error("Crops Deleted Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data || err);
    }
  };

  return (
    <div className="shadow-lg rounded-lg border border-gray-200 p-4 bg-white">
      {/* 🔎 Search + Row Selector */}
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
          {selectedCrops.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="mb-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
            >
              Delete ({selectedCrops.length})
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search crops..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-md w-full sm:w-60"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#cbff2e] text-grey-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginatedCrops.length > 0 &&
                    selectedCrops.length === paginatedCrops.length
                  }
                />
              </th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Crop Name</th>
              <th className="px-4 py-3">Crop Category</th>
              <th className="px-4 py-3">Stages</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedCrops.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  No matching crops found.
                </td>
              </tr>
            ) : (
              paginatedCrops.map((crop, index) => (
                <tr key={crop.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={selectedCrops.includes(crop.id)}
                      onChange={() => handleSelect(crop.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{crop.id}</td>
                  <td className="px-4 py-2">{crop.crop_name}</td>
                  <td className="px-4 py-2">{crop.category_name}</td>

                  <td className="px-4 py-2">
                    {crop.crop_stages?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {crop.crop_stages.map(
                          (stage, i) =>
                            stage.stage_name?.trim() && (
                              <span
                                key={i}
                                className="px-2 py-1 bg-[#cbff2e] text-black text-xs rounded-full"
                              >
                                {stage.stage_name}
                              </span>
                            ),
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No stages</span>
                    )}
                  </td>

                  <td className="px-4 py-2 flex justify-center gap-3">
                    <button
                      onClick={() => onEditClick(crop)}
                      className="p-2 bg-blue-100 text-blue-500 cursor-pointer hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteClick(crop)}
                      className="p-2 bg-red-100 text-red-400 cursor-pointer hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onViewClick(crop)}
                      className="p-2 bg-gray-200 text-gray-500 cursor-pointer hover:text-black"
                    >
                      <View className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
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
  );
}
