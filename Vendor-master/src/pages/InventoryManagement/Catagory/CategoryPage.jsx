import React, { useEffect, useMemo, useState } from "react";

import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import DataTable from "../../../components/DataTable";

import CategoryModal from "../../../components/InventoryManagement/Catagory/CategoryModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import toast from "react-hot-toast";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // ✅ BULK DELETE STATE
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [brandData, categoryData] = await Promise.all([
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);

      setBrands(brandData);

      const enriched = categoryData.map((c) => ({
        ...c,
        brandName:
          brandData.find((b) => b.id === c.brandId)?.name || "-",
      }));

      setCategories(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Load Categories");
    }
    setLoading(false);
  }

  // ---------------- CREATE / UPDATE ----------------
  async function handleSubmit(payload) {
    if (editingData) {
      const updated = await categoryService.updateCategory(
        editingData.id,
        payload
      );

      const brandName =
        brands.find((b) => b.id === updated.brandId)?.name || "-";

      setCategories((prev) =>
        prev.map((c) =>
          c.id === updated.id ? { ...updated, brandName } : c
        )
      );
    } else {
      const created = await categoryService.createCategory(payload);

      const brandName =
        brands.find((b) => b.id === created.brandId)?.name || "-";

      setCategories((prev) => [
        { ...created, brandName },
        ...prev,
      ]);
    }
  }

  // ---------------- SINGLE DELETE ----------------
  async function handleDeleteConfirmed() {
    try {
      await categoryService.deleteCategory(toDelete.id);
      setCategories((prev) =>
        prev.filter((c) => c.id !== toDelete.id)
      );
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
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

      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
      setSelectedRows([]);
    }
  }

  // ---------------- FILTER ----------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) =>
      (c.name || "").toLowerCase().includes(q)
    );
  }, [categories, search]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ---------------- COLUMNS ----------------
  const columns = [
    { key: "id", label: "ID", render: (row) => row.id },

    {
      key: "createdAt",
      label: "Created",
      render: (row) => formatDate(row.createdAt),
    },

    {
      key: "updatedAt",
      label: "Updated",
      render: (row) => formatDate(row.updatedAt),
    },

    {
      key: "brandName",
      label: "Brand Name",
      render: (row) => row.brandName,
    },

    { key: "name", label: "Category", render: (row) => row.name },

    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border rounded text-sm"
            onClick={() => {
              setEditingData(row);
              setModalOpen(true);
            }}
          >
            Edit
          </button>

          <button
            className="px-2 py-1 border rounded text-sm text-red-600"
            onClick={() => {
              setToDelete(row);
              setConfirmOpen(true);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // ---------------- UI ----------------
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

      <SearchBar value={search} onChange={setSearch} />

      {/* ✅ UPDATED DATATABLE */}
      <DataTable
        columns={columns}
        data={pageItems}
        loading={loading}
        onSelectionChange={setSelectedRows}
        onDeleteSelected={handleBulkDeleteRequest}
      />

       <Pagination
        page={page}
        pages={Math.ceil(categories.length / pageSize)}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);   // ✅ updates page size
          setPage(1);          // ✅ reset to first page
        }}
      />

      {/* Modal */}
      <CategoryModal
        open={modalOpen}
        initialData={editingData}
        brands={brands}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          await handleSubmit(payload);
          setModalOpen(false);
        }}
      />

      {/* Single Delete */}
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

      {/* ✅ BULK DELETE DIALOG */}
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

// ---------------- HELPER ----------------
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-GB");
}