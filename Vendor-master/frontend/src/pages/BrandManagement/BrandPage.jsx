import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import DataTable from "../../components/DataTable";
import BrandModal from "../../components/BrandManagement/BrandModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNavigate } from "react-router-dom";

import * as brandService from "../../api/InventoryManagementApis/brand.service";
import toast from "react-hot-toast";

export default function BrandPage() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
const [selectedRows, setSelectedRows] = useState([]);

function handleSelectionChange(rows) {
  setSelectedRows(rows);
}

function handleBulkDeleteRequest(rows) {
  setSelectedRows(rows);
  setBulkDeleteOpen(true); // open confirm dialog
}

async function handleBulkDeleteConfirm() {
  try {
    const ids = selectedRows.map((row) => row.id);

    await brandService.deleteMultipleBrands(ids);

    toast.success("Selected brands deleted!");

    fetchBrands(); // refresh list
  } catch (err) {
    console.error(err);
    toast.error("Bulk delete failed");
  } finally {
    setBulkDeleteOpen(false);
    setSelectedRows([]);
  }
}

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    setLoading(true);
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err) {
      console.error(err);
      toast.error("Fail to Load Brand")
    } finally {
      setLoading(false);
    }
  }

  // ---------------- CREATE ----------------
  async function handleCreate(payload) {
    const created = await brandService.createBrand(payload);
    if (created) {
      setBrands((prev) => [created, ...prev]);
    }
  }

  // ---------------- UPDATE ----------------
  async function handleUpdate(payload) {
    const updated = await brandService.updateBrand(editingBrand.id, payload);
    if (updated) {
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    }
  }

  // ---------------- DELETE ----------------
  async function handleDeleteConfirmed() {
    try {
      const res = await brandService.deleteBrand(brandToDelete.id);
      setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
      toast.error("Brand Deleted..!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to Delete Brand");
    } finally {
      setConfirmOpen(false);
      setBrandToDelete(null);
    }
  }

  // ---------------- FILTER + SEARCH ----------------
  const filtered = useMemo(() => {
    let result = [...brands];

    if (search.trim()) {
      result = result.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((b) => b.status === statusFilter);
    }

    return result;
  }, [brands, search, statusFilter]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ---------------- TABLE COLUMNS ----------------
  const columns = [
    {
      label: "ID",
      render: (row) => row.id,
    },
    {
      label: "Logo",
      render: (row) => (
        <div className="w-12 h-12">
          {row.logoUrl ? (
            <img
              src={row.logoUrl}
              alt={row.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              N/A
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Brand Name",
      render: (row) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() =>
            navigate(`/vendor/brand-management/${row.id}/products`)
          }
        >
          {row.name}
        </button>
      ),
    },
    {
      label: "Status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Created",
      render: (row) => {
        const date = new Date(row.createdAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },
    {
      label: "Updated",
      render: (row) => {
        const date = new Date(row.updatedAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },

    {
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            onClick={() => {
              setEditingBrand(row);
              setModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setBrandToDelete(row);
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
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Brand Management"
        subtitle="Create, update and manage brands"
        buttonText="+ Add Brand"
        onButtonClick={() => {
          setEditingBrand(null);
          setModalOpen(true);
        }}
      />

      {/* Search + Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          className="border rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search brand..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 w-full sm:w-40 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

     <DataTable
  columns={columns}
  data={pageItems}
  loading={loading}
  onSelectionChange={(rows) => {
    console.log("Selected Rows:", rows); // 🔍 DEBUG
    setSelectedRows(rows);
  }}
  onDeleteSelected={(rows) => {
    console.log("Delete clicked rows:", rows); // 🔍 DEBUG
    setSelectedRows(rows);
    setBulkDeleteOpen(true);
  }}
/>
      <Pagination
  page={page}
  pages={Math.ceil(brands.length / pageSize)}
  onPageChange={setPage}
  pageSize={pageSize}
  onPageSizeChange={(size) => {
    setPageSize(size);   // ✅ updates page size
    setPage(1);          // ✅ reset to first page
  }}
/>
      {/* Create / Edit Modal */}
      <BrandModal
        open={modalOpen}
        initialData={editingBrand}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingBrand) await handleUpdate(payload);
          else await handleCreate(payload);
          setModalOpen(false);
          fetchBrands();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}"?`}
        onCancel={() => {
          setConfirmOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={handleDeleteConfirmed}
      />
      <ConfirmDialog
  open={bulkDeleteOpen}
  title="Delete Selected Brands"
  message={`Are you sure you want to delete ${selectedRows.length} selected brand(s)?`}
  onCancel={() => {
    setBulkDeleteOpen(false);
    setSelectedRows([]);
  }}
  onConfirm={handleBulkDeleteConfirm}
/>
    </div>
  );
}
