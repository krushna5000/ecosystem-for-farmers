import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";

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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pagination, setPagination] = useState({});

  // ✅ BULK DELETE STATE
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // ------------------------------------------------
  // LOAD EVERYTHING
  // ------------------------------------------------
  useEffect(() => {
    loadBrands();
    loadCategories();
    loadSubCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, pageSize]);

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
    const data = await subCategoryService.getAllSubCategories();
    setSubCategories(data);
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await productService.getProductsTable(page, pageSize);

      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------
  // CREATE
  // ------------------------------------------------
  async function handleCreate(payload) {
    const created = await productService.createProduct(payload);
    await loadProducts()
  }

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------
  async function handleUpdate(payload) {
    const updated = await productService.updateProduct(
      editingProduct.id,
      payload,
    );

    await loadProducts();
  }

  // ------------------------------------------------
  // DELETE
  // ------------------------------------------------
  async function handleDeleteConfirmed() {
  try {
    await productService.deleteProduct(toDelete.id);
    toast.success("Product deleted successfully");
    await loadProducts();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete product");
  } finally {
    setConfirmOpen(false);
    setToDelete(null);
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

      await productService.deleteMultipleProducts(ids);

      toast.success("Selected products deleted!");

      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
      setSelectedRows([]);
    }
  }

  // ------------------------------------------------
  // SEARCH + PAGINATION
  // ------------------------------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [products, search]);

  // ------------------------------------------------
  // TABLE COLUMNS | NO STATUS | ORDER AS REQUESTED
  // 1. ID
  // 2. Created At
  // 3. Updated At
  // 4. Brand
  // 5. Category
  // 6. Sub-category
  // 7. Product Name
  // 9. Image
  // 10. Actions
  // ------------------------------------------------

  const columns = [
    { label: "ID", render: (row) => row.id },

    { label: "Created At", render: (row) => formatDate(row.createdAt) },

    { label: "Updated At", render: (row) => formatDate(row.updatedAt) },

    { label: "Brand", render: (row) => row.brandName },

    { label: "Category", render: (row) => row.categoryName },

    { label: "Sub-Category", render: (row) => row.subCategoryName },

    { label: "Product Name", render: (row) => row.name },

    {
      label: "Image",
      render: (row) => (
        <div style={{ width: 50, height: 50 }}>
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
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* EDIT */}
          <button
            onClick={() => {
              setEditingProduct(row);
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
      {/* Header */}
      <PageHeader
        title="Product Management"
        subtitle="Manage all products"
        buttonText="+ Add Product"
        onButtonClick={() => {
          setEditingProduct(null);
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
      <ProductModal
        open={modalOpen}
        initialData={editingProduct}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingProduct) await handleUpdate(payload);
          else await handleCreate(payload);
        }}
      />

      {/* Delete */}
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

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}
