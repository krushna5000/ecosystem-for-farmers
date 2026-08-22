import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import DataTable from "../../../components/DataTable";
import Pagination from "../../../components/Pagination";
import InventoryModal from "../../../components/InventoryManagement/Inventory/InventoryModal";
import toast from "react-hot-toast";

import * as inventoryService from "../../../api/InventoryManagementApis/inventory.service";
import * as productService from "../../../api/InventoryManagementApis/product.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [pagination, setPagination] = useState({});

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    fetchAll();
  }, [page, pageSize]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [allInventory, allProducts, allBrands] = await Promise.all([
        inventoryService.getInventoryList(page, pageSize),
        productService.getAllProducts(),
        brandService.getAllBrands(),
      ]);

      setInventory(allInventory.inventory || []);
      console.log("all inventory data: ", allInventory)
      setPagination(allInventory.pagination || {});
      setProducts(allProducts);
      console.log("all products : ", allProducts)
      setBrands(allBrands);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- ADD / UPDATE ----------------
  async function handleSubmit(payload) {
    try {
      if (editingItem) {
        await inventoryService.updateInventory(editingItem.id, payload);
        toast.success("Inventory updated successfully");
      } else {
        await inventoryService.createInventory(payload);
        toast.success("Inventory added successfully");
      }
      await fetchAll();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  }

  // ---------------- FILTER PRODUCTS (ADD MODE) ----------------
  // const availableProducts = useMemo(() => {
  //   const usedIds = new Set(inventory.map((i) => i.product_id));
  //   return products.filter((p) => !usedIds.has(p.id));
  // }, [inventory, products]);

  // ---------------- PAGINATION ----------------

  async function updateQuantity(row, inputEl) {
    const newQty = Number(inputEl.value);

    if (newQty === row.quantity) return;
    if (newQty < 0 || Number.isNaN(newQty)) {
      inputEl.value = row.quantity;
      return;
    }

    try {
      setUpdatingId(row.id);
      await inventoryService.updateInventory(row.id, {
        quantity: newQty,
      });
      await fetchAll();
    } catch (err) {
      toast.error("Failed to update quantity");
      inputEl.value = row.quantity;
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------------- TABLE COLUMNS ----------------
  const columns = [
    {
      label: "Product",
      render: (row) => row.product_name,
    },
    {
      label: "Quantity",
      render: (row) => (
        <input
          type="number"
          min="0"
          defaultValue={row.quantity}
          disabled={updatingId === row.id}
          className="w-20 border rounded px-2 py-1 text-center"
          onBlur={(e) => updateQuantity(row, e.target)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.target.blur(); // triggers save + exits input
            }
          }}
        />
      ),
    },

    {
      label: "Stock Status",
      render: (row) => {
        const isInStock = row.stock_status === "IN_STOCK";
        const label = isInStock ? "In stock" : "Out of stock";

        return (
          <span
            className={`px-2 py-1 rounded text-sm ${
              isInStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {label}
          </span>
        );
      },
    },

    // {
    //   label: "Actions",
    //   render: (row) => (
    //     <button
    //       onClick={() => {
    //         setEditingItem(row);
    //         setModalOpen(true);
    //       }}
    //       className="text-blue-600 hover:underline"
    //     >
    //       Edit
    //     </button>
    //   ),
    // },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Inventory Management"
        subtitle="Manage stock for all products"
        buttonText="+ Add Inventory"
        onButtonClick={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}
      />

      <div className="bg-white rounded-xl shadow-md mt-4 p-5">
        <DataTable columns={columns} data={inventory} loading={loading} />
        <Pagination
          page={page}
          pages={pagination.totalPages || 1}
          onPageChange={setPage}
        />
      </div>

      {/* INVENTORY MODAL */}
      <InventoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingItem}
        brands={brands}
        products={products}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
