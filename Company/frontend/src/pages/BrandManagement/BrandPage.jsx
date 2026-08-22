import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import DataTable from "../../components/DataTable";
import BrandModal from "../../components/BrandManagement/BrandModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import * as brandService from "../../api/InventoryManagementApis/brand.service";

export default function BrandPage() {
  const [statusFilter, setStatusFilter] = useState("All");

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // const pageSize = 4;
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({})

    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
const [selectedRows, setSelectedRows] = useState([]);


  

  const navigate = useNavigate();

  // --- FETCH BRANDS ---
  useEffect(() => {
    fetchBrands();
  }, [page, pageSize]);

  //reset page when page size changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  async function fetchBrands() {
    setLoading(true);
    try {
      const data = await brandService.getBrandsTable(page, pageSize);
      setBrands(data.brands || []);
      setPagination(data.pagination || {}); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }
  //handle bulk delete
  async function handleBulkDeleteConfirm() {
  try {
    const ids = selectedRows.map((row) => row.id);

    await brandService.deleteMultipleBrands(ids);

    toast.success("Selected brands deleted!");

    await fetchBrands(); // refresh list
  } catch (err) {
    console.error(err);
    toast.error("Bulk delete failed");
  } finally {
    setBulkDeleteOpen(false);
    setSelectedRows([]);
  }
}

  // --- CREATE ---
  async function handleCreate(payload) {
    const created = await brandService.createBrand(payload);
    // setBrands((prev) => [created, ...prev]);
    await fetchBrands()
  }

  // --- UPDATE ---
  async function handleUpdate(payload) {
    const updated = await brandService.updateBrand(editingBrand.id, payload);
    // setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    await fetchBrands(); 
  }

  // --- DELETE ---
  async function handleDeleteConfirmed() {
    try {
      await brandService.deleteBrand(brandToDelete.id);

      // setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));

      toast.success("Brand deleted successfully");
      await fetchBrands()

      setConfirmOpen(false);
      setBrandToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete brand");
    }
  }

  // --- SEARCH + FILTER + PAGINATION ---
  const filtered = useMemo(() => {
    let result = brands;

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((b) => (b.name || "").toLowerCase().includes(q));
    }

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter((b) => b.status === statusFilter);
    }

    return result;
  }, [brands, search, statusFilter]);

  // --- TABLE COLUMNS ---
  const columns = [
    { label: "ID", render: (row) => row.id },
    { label: "Created At", render: (row) => formatDate(row.createdAt) },
    { label: "Updated At", render: (row) => formatDate(row.updatedAt) },
    {
      label: "Logo",
      render: (row) => (
        <div style={{ width: 50, height: 50 }}>
          {row.logoUrl ? (
            <img
              src={row.logoUrl}
              className="w-full h-full rounded-full object-cover"
              alt={row.name}
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
          className="text-blue-600 underline cursor-pointer"
          onClick={() =>
            navigate(`/company/brand-management/${row.id}/products`)
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
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* EDIT */}
          <button
            onClick={() => {
              setEditingBrand(row);
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
              setBrandToDelete(row);
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
      {/* Header */}
      <PageHeader
        title="Brand Management"
        subtitle="Manage or create all brand entries"
        buttonText="+ Add Brand"
        onButtonClick={() => {
          setEditingBrand(null);
          setModalOpen(true);
        }}
      />

      <div className="bg-white rounded-xl shadow-md mt-4 p-5">
        {/* TOP CONTROLS */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          {/* LEFT — STATUS FILTER + ROWS */}
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:items-center sm:w-auto">
            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 sm:h-8 border border-gray-300 rounded-lg px-3 sm:px-2 bg-white cursor-pointer text-base sm:text-sm focus:border-[#CBFF2E] focus:ring-1 focus:ring-[#CBFF2E] outline-none transition-all"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* ROWS PER PAGE (ADDED HERE) */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm text-gray-600">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-10 sm:h-8 border border-gray-300 rounded-lg px-3 sm:px-2 bg-white cursor-pointer text-base sm:text-sm focus:border-[#CBFF2E] focus:ring-1 focus:ring-[#CBFF2E] outline-none transition-all"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* RIGHT — SEARCH */}
          <div className="w-full md:w-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* TABLE */}
       <DataTable
  columns={columns}
  data={filtered}
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

      {/* Brand Modal */}
      <BrandModal
        open={modalOpen}
        initialData={editingBrand}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingBrand) await handleUpdate(payload);
          else await handleCreate(payload);
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

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}
