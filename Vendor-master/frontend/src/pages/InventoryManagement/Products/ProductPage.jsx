import React, { useEffect, useMemo, useState } from "react";

import PageHeader from "../../../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import DataTable from "../../../components/DataTable";

import ProductModal from "../../../components/InventoryManagement/Product/ProductModal";
import ConfirmDialog from "../../../components/ConfirmDialog";

import * as productService from "../../../api/InventoryManagementApis/product.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as subCategoryService from "../../../api/InventoryManagementApis/subcategory.service";
import toast from "react-hot-toast";

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // ✅ BULK DELETE STATE
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [pagination, setPagination] = useState({});

  // ---------------- LOAD ----------------
  useEffect(() => {
    loadProducts();
  }, [page, pageSize]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await productService.getAllProducts(page, pageSize);

      if (!res) return;

      setProducts(res.products);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
      toast.error("Failed to Load Product");
    }
    setLoading(false);
  }

  // ---------------- CREATE ----------------
  async function handleCreate(payload) {
    const created = await productService.createProduct(payload);
    await loadProducts();
  }

  // ---------------- UPDATE ----------------
  async function handleUpdate(payload) {
    const updated = await productService.updateProduct(
      editingProduct.id,
      payload,
    );

    await loadProducts();
  }

  // ---------------- SINGLE DELETE ----------------
  async function handleDeleteConfirmed() {
    try {
      await productService.deleteProduct(toDelete.id);
      toast.success("Product deleted");
      await loadProducts();
      if (pagination.currentPage > pagination.totalPages) {
        setPage(pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to delete product");
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

      await productService.deleteMultipleProducts(ids);

      toast.success("Selected products deleted!");

      await loadProducts();

      if (pagination.currentPage > pagination.totalPages) {
        setPage(pagination.totalPages || 1);
      }
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
    if (!q) return products;

    return products.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [products, search]);

  // const total = filtered.length;
  // const pages = Math.max(1, Math.ceil(total / pageSize));
  // const pageItems = filtered.slice(
  //   (page - 1) * pageSize,
  //   page * pageSize
  // );

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

    { key: "brandName", label: "Brand", render: (row) => row.brandName },

    {
      key: "categoryName",
      label: "Category",
      render: (row) => row.categoryName,
    },

    {
      key: "subCategoryName",
      label: "Sub-Category",
      render: (row) => row.subCategoryName,
    },

    { key: "name", label: "Product Name", render: (row) => row.name },

    {
      key: "image",
      label: "Image",
      render: (row) => (
        <div className="w-12 h-12">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt="product"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded">
              N/A
            </div>
          )}
        </div>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border rounded text-sm"
            onClick={() => {
              setEditingProduct(row);
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
        title="Product Management"
        subtitle="Manage all products"
        buttonText="+ Add Product"
        onButtonClick={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
      />

      <SearchBar value={search} onChange={setSearch} />

      {/* ✅ UPDATED TABLE */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onSelectionChange={setSelectedRows}
        onDeleteSelected={handleBulkDeleteRequest}
      />

      <Pagination
        page={page || 1}
        pages={pagination.totalPages || 1}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size); // ✅ updates page size
          setPage(1); // ✅ reset to first page
        }}
      />

      <ProductModal
        open={modalOpen}
        initialData={editingProduct}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingProduct) await handleUpdate(payload);
          else await handleCreate(payload);
          // await loadProducts();
        }}
      />

      {/* Single Delete */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Product"
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
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedRows.length} selected product(s)?`}
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
