import React, { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/cropCategoryApi";
import CropHeader from "../../components/Crop Management/CropHeader";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import ConfirmationPopup from "../ConfirmationPopup";
import axios from "axios";
import { domain } from "../../utils/domain";

export default function CropCategory() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteCategoryData, setDeleteCategoryData] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    id: "",
    category_name: "",
    description: "",
  });

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleOpenPopup = () => {
    setFormData({ id: "", category_name: "" });
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEditClick = (category) => {
    setFormData({
      id: category.id,
      category_name: category.category_name,
      description: category.description || "", // FIX: Include description
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDeleteClick = (category) => {
    setDeleteCategoryData(category);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteCategoryData) return;
    console.log(deleteCategoryData);

    try {
      const response = await deleteCategory(deleteCategoryData);

      if (response.data.success) {
        toast.success("Category deleted.");
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsConfirmOpen(false);
      setDeleteCategoryData(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      if (isEditing) {
        // UPDATE
        const res = await updateCategory(formData.id, {
          category_name: formData.category_name,
          description: formData.description,
        });
        if (res.data.success) {
          toast.success("Category Updated.");
          fetchCategories();
          setIsOpen(false);
        }
      } else {
        // CREATE
        const res = await createCategory({
          category_name: formData.category_name,
          description: formData.description,
        });

        if (res.data.success) {
          toast.success("Category created.");
          fetchCategories();
          setIsOpen(false);
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCategoryNameChange = (e) => {
    const value = e.target.value;

    // Allow only alphabets and spaces
    const regex = /^[A-Za-z\s]*$/;

    if (!regex.test(value)) {
      toast.error("Only alphabets are allowed.");
      return;
    }

    setFormData({ ...formData, category_name: value });
  };

  // Filter crops based on search
  const filteredCrops = useMemo(() => {
    return categories.filter((category) => {
      const s = search.toLowerCase();
      return (
        category.category_name?.toLowerCase().includes(s) ||
        category.description?.toLowerCase().includes(s)
      );
    });
  }, [search, categories]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCrops.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedcategories = filteredCrops.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSelect = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const ids = paginatedcategories.map((admin) => admin.id);

    if (selectedCategories.length === ids.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(ids);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await axios.delete(
        `${domain}/crop-categories/bulk-delete`,
        {
          data: { ids: selectedCategories },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setSelectedCategories([]);
        await fetchCategories();
        toast.error("Crop Categories Deleted Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data || err);
    }
  };

  return (
    <>
      <CropHeader type="category" onCreateClick={handleOpenPopup} />

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
            {selectedCategories.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="mb-3 bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Delete ({selectedCategories.length})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md w-full sm:w-60"
          />
        </div>

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
                      paginatedcategories.length > 0 &&
                      selectedCategories.length === paginatedcategories.length
                    }
                  />
                </th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedcategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                      Loading crop Categories...
                    </div>
                  </td>
                </tr>
              ) : paginatedcategories.length > 0 ? (
                paginatedcategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        className="cursor-pointer"
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelect(category.id)}
                      />
                    </td>
                    <td className="px-4 py-2">{category.id}</td>
                    <td className="px-4 py-2">{category.category_name}</td>
                    <td className="px-4 py-2">{category.description}</td>
                    <td className="px-4 py-2 flex justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
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
                    colSpan="4"
                    className="text-center py-4 text-gray-600 font-semibold"
                  >
                    No crop categories found.
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

        {/* POPUP */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-sm p-6 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-semibold text-center mb-5">
                {isEditing ? "Update Crop Category" : "Add Crop Category"}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.category_name}
                    onChange={handleCategoryNameChange}
                    placeholder="Enter Category Name"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter Description"
                    rows="4"
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
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Category"
          message={`Are you sure you want to delete ${deleteCategoryData?.category_name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </>
  );
}
