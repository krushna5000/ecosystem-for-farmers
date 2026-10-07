import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import DataTable from "../../../components/DataTable";

import SubCategoryModal from "../../../components/InventoryManagement/SubCategory/SubCategoryModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

import * as subCategoryService from "../../../api/InventoryManagementApis/subcategory.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";

export default function SubCategoryPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({});

  // ✅ BULK DELETE STATE
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [toggleCleared, setToggleCleared] = useState(false);

  // ---------------------------
  // LOAD ALL DATA
  // ---------------------------

  useEffect(() => {
    loadSubCategories();
  }, [page, pageSize]);

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, []);

  //reset page on change
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  async function loadBrands() {
    const data = await brandService.getAllBrands();
    setBrands(data);
  }

  async function loadCategories() {
    const data = await categoryService.getAllCategories();
    setCategories(data);
  }

  async function loadSubCategories() {
    setLoading(true);

    try {
      // Load all 3 datasets in parallel (best performance)
      const [subcatData, brandData, categoryData] = await Promise.all([
        subCategoryService.getSubCategoriesTable(page, pageSize),
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);

      // Map brandId → brandName and categoryId → categoryName
      const enriched = (subcatData?.subcategories || []).map((sc) => ({
        ...sc,
        brandName: brandData.find((b) => b.id === sc.brandId)?.name || "-",
        categoryName:
          (categoryData || []).find((c) => c.id === sc.categoryId)?.name || "-",
      }));

      setBrands(brandData || []);
      setCategories(categoryData || []);
      setSubCategories(enriched);
      setPagination(subcatData.pagination || {});
    } catch (err) {
      console.error("Error loading subcategories:", err);
      toast.error("Failed to load sub-categories");
    }

    setLoading(false);
  }

  // ---------------------------
  // CREATE
  // ---------------------------
  async function handleCreate(payload) {
    const created = await subCategoryService.createSubCategory(payload);
    setSubCategories((prev) => [created, ...prev]);
  }

  // ---------------------------
  // UPDATE
  // ---------------------------
  async function handleUpdate(payload) {
    const updated = await subCategoryService.updateSubCategory(
      editingData.id,
      payload,
    );

    setSubCategories((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s)),
    );
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  async function handleDeleteConfirmed() {
    try {
      await subCategoryService.deleteSubCategory(toDelete.id);
      setSubCategories((prev) => prev.filter((s) => s.id !== toDelete.id));
      toast.success("Sub-Category deleted successfully");
      setConfirmOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sub-category");
    }
  }

  //bulk delete

  function handleBulkDeleteRequest(rows) {
    setSelectedRows(rows);
    setBulkDeleteOpen(true);
  }

  async function handleBulkDeleteConfirm() {
    try {
      const ids = selectedRows.map((r) => r.id);

      if (!ids.length) {
        return toast.error("No items selected");
      }

      await subCategoryService.deleteMultipleSubCategories(ids);

      toast.success("Selected sub-categories deleted!");

      loadSubCategories();
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
      setSelectedRows([]);
      setToggleCleared((prev) => !prev);
    }
  }

  // ---------------------------
  // SEARCH + PAGINATION
  // ---------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subCategories;
    return subCategories.filter((s) =>
      (s.name || "").toLowerCase().includes(q),
    );
  }, [subCategories, search]);

  // ---------------------------
  // TABLE COLUMNS (Your Required Order)
  // 1. ID
  // 2. Created At
  // 3. Updated At
  // 4. Brand Name
  // 5. Category Name
  // 6. Sub-Category Name
  // 7. Status
  // 8. Actions
  // ---------------------------

  const columns = [
    { label: "ID", render: (row) => row.id },

    {
      label: "Created At",
      render: (row) => formatDate(row.createdAt),
    },

    {
      label: "Updated At",
      render: (row) => formatDate(row.updatedAt),
    },

    {
      label: "Brand",
      render: (row) => row.brandName,
    },

    {
      label: "Category",
      render: (row) => row.categoryName,
    },

    {
      label: "Sub-Category",
      render: (row) => row.name,
    },

    {
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* EDIT */}
          <button
            onClick={() => {
              setEditingData(row);
              setModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            title="Edit"
          >
            <Pencil size={18} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => {
              setToDelete(row);
              setConfirmOpen(true);
            }}
            className="text-red-600 hover:text-red-800 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Sub-Category Management"
        subtitle="Manage or create product sub-categories"
        buttonText="+ Add Sub-Category"
        onButtonClick={() => {
          setEditingData(null);
          setModalOpen(true);
        }}
      />

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-md mt-4 p-5">
        {/* TOP CONTROLS */}
        <div className="flex items-center justify-between mb-4">
          {/* LEFT — ROWS PER PAGE */}
          <div className="flex items-center gap-2 px-1 whitespace-nowrap">
            <span className="text-sm text-gray-600">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-10 sm:h-8 border border-gray-300 rounded-lg px-3 sm:px-2 bg-white cursor-pointer text-base sm:text-sm focus:border-[#CBFF2E] focus:ring-1 focus:ring-[#CBFF2E] outline-none transition-all"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          {/* RIGHT — SEARCH */}
          <div className="w-full md:w-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* ✅ UPDATED TABLE */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onSelectionChange={setSelectedRows}
          onDeleteSelected={handleBulkDeleteRequest}
          clearSelectedRows={toggleCleared}
        />

        {/* PAGINATION */}
        {/*<Pagination page={page} pages={pages} onPageChange={setPage} />*/}
        <Pagination
          page={page}
          pages={pagination.totalPages || 1}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Modal */}
      <SubCategoryModal
        open={modalOpen}
        initialData={editingData}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingData) await handleUpdate(payload);
          else await handleCreate(payload);

          await loadSubCategories();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Sub-Category"
        message={`Are you sure you want to delete "${toDelete?.name}"?`}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
      />
      {/* ✅ BULK DELETE */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Selected Sub-Categories"
        message={`Are you sure you want to delete ${selectedRows.length} selected sub-category(s)?`}
        onCancel={() => {
          setBulkDeleteOpen(false);
          setSelectedRows([]);
        }}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

// Format Dates
function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}
