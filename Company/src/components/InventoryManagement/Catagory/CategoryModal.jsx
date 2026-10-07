import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper";
import toast from "react-hot-toast";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";

export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData);

  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [submitting, setSubmitting] = useState(false);

  // Load all brands for dropdown
  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    const res = await brandService.getAllBrands();
    setBrands(res || []);
  }

  // When editing, load initial data
  useEffect(() => {
    if (initialData) {
      setBrandId(initialData.brandId);
      setBrandName(initialData.brandName);
      setName(initialData.name);
      setStatus(initialData.status);
    } else {
      setBrandId("");
      setBrandName("");
      setName("");
      setStatus("Active");
    }
  }, [initialData, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        brandId,
        brandName,
        name: name.trim(),
        status,
        createdAt: initialData?.createdAt,
      });

      toast.success(isEdit ? "Category updated!" : "Category created!");
      onClose();
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Category" : "Add Category"}
          </h2>
          <p className="text-sm text-gray-500">Assign category to a brand</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Brand Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Brand{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <select
              required
              value={brandId}
              onChange={(e) => {
                const id = e.target.value;
                setBrandId(id);
                const selectedBrand = (brands || []).find(
                  (b) => Number(b.id) === Number(id),
                );
                setBrandName(selectedBrand?.name || "");
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300 cursor-pointer"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
            />
          </div>

          {/* Status (future-ready, visually hidden) */}
          {/* 
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 bg-white"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        */}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[#BBF451] text-black font-medium hover:brightness-95 disabled:opacity-60 cursor-pointer"
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Add Category"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
