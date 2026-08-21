import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import ModalWrapper from "../../ModalWrapper";

export default function InventoryModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  products = [],
  brands = [],
}) {
  const isEdit = Boolean(initialData);
  const [brandId, setBrandId] = useState("");
  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  //filter products by selected brands
  const filteredProducts = useMemo(() => {
    if (!brandId) return [];
    return products.filter((p) => p.brandId === Number(brandId));
  }, [brandId, products]);

  // Initialize form
  useEffect(() => {
    if (initialData) {
      setBrandId("");
      setProductId(initialData.product_id);
      setSelectedProduct({
        name: initialData.product_name,
      });
      setQuantity(initialData.quantity);
    } else {
      setProductId("");
      setSelectedProduct(null);
      setQuantity("");
    }
  }, [initialData, open]);

  // When product changes (ADD mode)
  useEffect(() => {
    if (!productId) return;

    const p = products.find((x) => x.id === Number(productId));
    setSelectedProduct(p || null);
  }, [productId, products]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isEdit && !brandId) {
      toast.error("Please select a brand");
      return;
    }

    if (!isEdit && !productId) {
      toast.error("Please select a product");
      return;
    }

    if (quantity === "" || Number(quantity) < 0) {
      toast.error("Quantity must be 0 or more");
      return;
    }

    setSubmitting(true);

    try {
      const payload = isEdit
        ? { quantity: Number(quantity) }
        : { product_id: Number(productId), quantity: Number(quantity) };

      await onSubmit(payload);

      toast.success(isEdit ? "Inventory updated" : "Inventory added");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const stockStatus = Number(quantity) > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

  console.log("Selected Brand ID:", brandId);

  console.log("All Products:", products);

  console.log("Filtered Products:", filteredProducts);

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">
            {isEdit ? "Update Inventory" : "Add Inventory"}
          </h2>
          <p className="text-sm text-gray-500">
            {isEdit ? "View product details" : "Add product to inventory"}
          </p>
        </div>

        {/* Product */}
        {!isEdit ? (
          <div>
            <label className="block text-sm font-medium">
              Brand{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setProductId("");
                setSelectedProduct(null);
              }}
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white cursor-pointer"
            >
              <option value="">
                Select brand{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium">
              Product{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={!brandId}
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100 cursor-pointer"
            >
              <option value="">
                {brandId ? "Select product" : "Select brand first"}
              </option>

              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium">Product</label>
            <input
              disabled
              value={initialData.product_name}
              className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>
        )}

        {/* Quantity (ADD MODE ONLY) */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium">
              Quantity{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}

        {/* Stock Status (ADD MODE ONLY) */}
        {/* {!isEdit && (
          <div>
            <label className="block text-sm font-medium">Stock Status</label>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded text-sm ${
                stockStatus === "IN_STOCK"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
            </span>
          </div>
        )} */}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[#BBF451] text-black font-medium disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
