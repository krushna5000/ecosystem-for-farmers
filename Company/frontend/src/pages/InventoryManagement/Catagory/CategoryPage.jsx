import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import DataTable from "../../../components/DataTable";

import CategoryModal from "../../../components/InventoryManagement/Catagory/CategoryModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

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

  // ---------------------------
  // LOAD BRANDS + CATEGORIES
  // ---------------------------
  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [page, pageSize]);

  //reset page on change
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  async function loadBrands() {
    const data = await brandService.getAllBrands();
    setBrands(data || []);
  }

  async function loadCategories() {
    setLoading(true);

    try {
      // Load categories + brands in parallel for best performance
      const [categoryData, brandData] = await Promise.all([
        categoryService.getCategoriesTable(page, pageSize),
        brandService.getAllBrands(),
      ]);
      // Merge brandName into categories
      const brandsArray = brandData || [];
      const categoriesList = categoryData.categories || [];

      const enriched = categoriesList.map((c) => ({
        ...c,
        brandName:
          brandsArray.find((b) => Number(b.id) === Number(c.brandId))?.name ||
          "-",
      }));

      setBrands(brandsArray);
      setCategories(enriched);
      setPagination(categoryData.pagination || {});
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    }

    setLoading(false);
  }

  // ---------------------------
  // CREATE
  // ---------------------------
  async function handleCreate(payload) {
    const created = await categoryService.createCategory(payload);

    // Attach brandName
    const brandName =
      (brands || []).find((b) => Number(b.id) === Number(created.brandId))
        ?.name || "-";

    setCategories((prev) => [{ ...created, brandName }, ...prev]);
  }

  // ---------------------------
  // UPDATE
  // ---------------------------
  async function handleUpdate(payload) {
    const updated = await categoryService.updateCategory(
      editingData.id,
      payload,
    );

    const brandName =
      (brands || []).find((b) => Number(b.id) === Number(updated.brandId))
        ?.name || "-";
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, brandName } : c)),
    );
  }

  // ---------------------------
  // DELETE
  // ---------------------------
  async function handleDeleteConfirmed() {
    try {
      await categoryService.deleteCategory(toDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id));
      toast.success("Category deleted successfully");
      setConfirmOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  }
  // ---------------- BULK DELETE ----------------
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

      await categoryService.deleteMultipleCategories(ids);

      toast.success("Selected categories deleted!");

      await loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
      setSelectedRows([]);
    }
  }

  // ---------------------------
  // SEARCH + PAGINATION
  // ---------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [categories, search]);

  const pageItems = filtered;

  // ---------------------------
  // TABLE COLUMNS
  // ---------------------------
  const columns = [
    // 1. ID
    {
      label: "ID",
      render: (row) => row.id,
    },

    // 2. Created At
    {
      label: "Created At",
      render: (row) => formatDate(row.createdAt),
    },

    // 3. Updated At
    {
      label: "Updated At",
      render: (row) => formatDate(row.updatedAt),
    },

    // 4. Brand Name
    {
      label: "Brand Name",
      render: (row) => <span className=" text-gray-800">{row.brandName}</span>,
    },

    // 5. Category Name
    {
      label: "Category",
      render: (row) => row.name,
    },

    // 6. Status
    // {
    //   label: "Status",
    //   render: (row) => (
    //     <span
    //       className={`px-2 py-1 rounded text-sm ${
    //         row.status === "Active"
    //           ? "bg-green-100 text-green-800"
    //           : "bg-gray-200 text-gray-700"
    //       }`}
    //     >
    //       {row.status}
    //     </span>
    //   ),
    // },

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
        title="Category Management"
        subtitle="Manage or create product categories"
        buttonText="+ Add Category"
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

        {/* TABLE */}
        {/* ✅ UPDATED DATATABLE */}
        <DataTable
          columns={columns}
          data={pageItems}
          loading={loading}
          onSelectionChange={setSelectedRows}
          onDeleteSelected={handleBulkDeleteRequest}
        />

        {/* PAGINATION */}
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
      <CategoryModal
        open={modalOpen}
        initialData={editingData}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingData) await handleUpdate(payload);
          else await handleCreate(payload);

          await loadCategories();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${toDelete?.name}"?`}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete Selected Categories"
        message={`Are you sure you want to delete ${selectedRows.length} selected category(s)?`}
        onCancel={() => {
          setBulkDeleteOpen(false);
          setSelectedRows([]);
        }}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}
