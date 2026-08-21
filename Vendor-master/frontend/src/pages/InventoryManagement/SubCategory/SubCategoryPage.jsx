import React, { useEffect, useMemo, useState } from "react";

import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import DataTable from "../../../components/DataTable";
import toast from "react-hot-toast";

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

  // ✅ BULK DELETE STATE
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadSubCategories();
  }, []);

  async function loadSubCategories() {
    setLoading(true);

    try {
      const [subcatData, brandData, categoryData] = await Promise.all([
        subCategoryService.getAllSubCategories(),
        brandService.getAllBrands(),
        categoryService.getAllCategories(),
      ]);

      const enriched = subcatData.map((sc) => ({
        ...sc,
        brandName:
          brandData.find((b) => b.id === sc.brandId)?.name || "-",
        categoryName:
          categoryData.find((c) => c.id === sc.categoryId)?.name || "-",
      }));

      setBrands(brandData);
      setCategories(categoryData);
      setSubCategories(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Load Sub-categories");
    }

    setLoading(false);
  }

  // ---------------- CREATE ----------------
  async function handleCreate(payload) {
    const created = await subCategoryService.createSubCategory(payload);
    setSubCategories((prev) => [created, ...prev]);
  }

  // ---------------- UPDATE ----------------
  async function handleUpdate(payload) {
    const updated = await subCategoryService.updateSubCategory(
      editingData.id,
      payload
    );

    setSubCategories((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }

  // ---------------- SINGLE DELETE ----------------
  async function handleDeleteConfirmed() {
    try {
      await subCategoryService.deleteSubCategory(toDelete.id);

      setSubCategories((prev) =>
        prev.filter((s) => s.id !== toDelete.id)
      );

      toast.success("Sub-category deleted");
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

      await subCategoryService.deleteMultipleSubCategories(ids);

      toast.success("Selected sub-categories deleted!");

      loadSubCategories();
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
    if (!q) return subCategories;

    return subCategories.filter((s) =>
      (s.name || "").toLowerCase().includes(q)
    );
  }, [subCategories, search]);

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
      label: "Brand",
      render: (row) => row.brandName,
    },

    {
      key: "categoryName",
      label: "Category",
      render: (row) => row.categoryName,
    },

    {
      key: "name",
      label: "Sub-Category",
      render: (row) => row.name,
    },

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
        title="Sub-Category Management"
        subtitle="Manage or create product sub-categories"
        buttonText="+ Add Sub-Category"
        onButtonClick={() => {
          setEditingData(null);
          setModalOpen(true);
        }}
      />

      <SearchBar value={search} onChange={setSearch} />

      {/* ✅ UPDATED TABLE */}
      <DataTable
        columns={columns}
        data={pageItems}
        loading={loading}
        onSelectionChange={setSelectedRows}
        onDeleteSelected={handleBulkDeleteRequest}
      />

       <Pagination
  page={page}
  pages={Math.ceil(subCategories.length / pageSize)}
  onPageChange={setPage}
  pageSize={pageSize}
  onPageSizeChange={(size) => {
    setPageSize(size);   // ✅ updates page size
    setPage(1);          // ✅ reset to first page
  }}
/>

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

      {/* Single Delete */}
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

// ---------------- HELPER ----------------
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("en-GB");
}