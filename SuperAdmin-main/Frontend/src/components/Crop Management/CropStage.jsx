import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import CropHeader from "./CropHeader";
import {
  getStages,
  createStage,
  updateStage,
  deleteStage,
} from "../../api/cropStageApi";
import ConfirmationPopup from "../ConfirmationPopup";
import { domain } from "../../utils/domain";
import axios from "axios";

export default function CropStage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cropStages, setCropStages] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStages, setSelectedStages] = useState([]);

  const [formData, setFormData] = useState({
    stageName: "",
    description: "",
  });

  // get all crop stages
  const fetchCropStages = async () => {
    try {
      const response = await getStages();

      if (response.data.success) {
        const mapped = response.data.data.map((item) => ({
          id: item.id,
          stageName: item.stage_name,
          description: item.description,
        }));
        setCropStages(mapped);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchCropStages();
  }, []);

  // add crop stage
  const createCropStage = async () => {
    try {
      const payload = {
        stage_name: formData.stageName,
        description: formData.description,
      };

      const response = await createStage(payload);

      if (response.data.success) {
        toast.success("Crop stage added!");
        fetchCropStages();
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // OPEN CREATE POPUP
  const handleCreateClick = () => {
    setIsEditing(false);
    setFormData({
      stageName: "",
      description: "",
    });
    setIsOpen(true);
  };

  // EDIT
  const handleEditClick = (stage) => {
    setIsEditing(true);
    setFormData({
      id: stage.id,
      stageName: stage.stageName,
      description: stage.description,
    });
    setIsOpen(true);
  };

  // Delete stage
  const handleDeleteClick = (stage) => {
    setStageToDelete(stage);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteStage(stageToDelete.id);

      if (response.data.success) {
        toast.success("Crop stage deleted!");
        fetchCropStages();
        setShowConfirm(!showConfirm);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // update crop stage
  const updateCropStage = async () => {
    try {
      const payload = {
        stage_name: formData.stageName,
        description: formData.description,
      };

      const response = await updateStage(formData.id, payload);

      if (response.data.success) {
        toast.success("Crop stage updated!");
        fetchCropStages();
        setIsOpen(false);
        setIsEditing(false);
        setFormData({ stageName: "", description: "" });
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.stageName.trim() || !formData.description.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    if (isEditing) {
      updateCropStage();
    } else {
      createCropStage();
    }
  };

  // Filter crops based on search
  const filteredStages = useMemo(() => {
    return cropStages.filter((stage) => {
      const s = search.toLowerCase();
      return (
        stage.stage_name?.toLowerCase().includes(s) ||
        stage.description?.toLowerCase().includes(s)
      );
    });
  }, [search, cropStages]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStages.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStages = filteredStages.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSelect = (id) => {
    setSelectedStages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const ids = paginatedStages.map((admin) => admin.id);

    if (selectedStages.length === ids.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages(ids);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.delete(`${domain}/crop-stages/bulk-delete`, {
        data: { ids: selectedStages },
        withCredentials: true,
      });

      if (response.data.success) {
        setSelectedStages([]);
        await fetchCropStages();
        toast.error("Crop Stages Deleted Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data || err);
    }
  };
  return (
    <>
      <CropHeader type="stage" onCreateClick={handleCreateClick} />

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
            {selectedStages.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="mb-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Delete ({selectedStages.length})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search stages..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md w-full sm:w-60"
          />
        </div>

        {/*  TABLE  */}
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
                      paginatedStages.length > 0 &&
                      selectedStages.length === paginatedStages.length
                    }
                  />
                </th>
                <th className="px-4 py-3">Id</th>
                <th className="px-4 py-3">Stage Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedStages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    <div className="flex justify-center items-center gap-2 text-blue-500">
                      <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                      Loading crops stages...
                    </div>
                  </td>
                </tr>
              ) : paginatedStages.length > 0 ? (
                paginatedStages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        checked={selectedStages.includes(stage.id)}
                        onChange={() => handleSelect(stage.id)}
                      />
                    </td>
                    <td className="px-4 py-2">{stage.id}</td>
                    <td className="px-4 py-2">{stage.stageName}</td>
                    <td className="px-4 py-2">{stage.description}</td>
                    <td className="px-4 py-2 flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(stage)}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(stage)}
                        className="text-red-600 cursor-pointer hover:text-red-800 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-600 font-semibold"
                  >
                    No crop stages found.
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

        {/* ----------------- POPUP ----------------- */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-sm p-6 relative">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsEditing(false);
                  setFormData({ stageName: "", description: "" });
                }}
                className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-semibold text-center mb-5">
                {isEditing ? "Update Crop Stage" : "Add Crop Stage"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    value={formData.stageName}
                    onChange={(e) =>
                      setFormData({ ...formData, stageName: e.target.value })
                    }
                    placeholder="Enter Stage Name"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter Description"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#cbff2e] font-semibold cursor-pointer py-2 rounded-lg hover:bg-[#baff00] transition-colors"
                >
                  {isEditing ? "Update" : "Add"}
                </button>
              </form>
            </div>
          </div>
        )}
        <ConfirmationPopup
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Crop Stage"
          message="Are you sure you want to delete this stage? This action cannot be undone."
          confirmText="Delete"
          confirmColor="bg-red-500 hover:bg-red-600"
        />
      </div>
    </>
  );
}
