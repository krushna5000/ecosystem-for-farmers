import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper";
import toast from "react-hot-toast";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";

export default function CategoryModal({ open, onClose, onSubmit, initialData }) {
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
    const data = await brandService.getAllBrands();
    setBrands(data);
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
    // Load all categories for duplicate check
    const allCategories = await categoryService.getAllCategories();

    const exists = allCategories.some(
      (c) =>
        c.brandId === brandId && // category should be unique inside same brand
        c.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        c.id !== initialData?.id
    );

    if (exists) {
      toast.error("Category already exists for this brand!");
      setSubmitting(false);
      return;
    }

    // Submit
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
    toast.error("Something went wrong!");
  } finally {
    setSubmitting(false);
  }
}


  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Category" : "Add Category"}
        </h2>

        {/* Brand Dropdown */}
        <label className="block text-sm mt-2">Select Brand <span className="text-red-500">*</span></label>
<select
  required
  value={brandId}
  onChange={(e) => {
    const id = e.target.value;
    setBrandId(id);

    // IMPORTANT FIX: update brandName here
    const selectedBrand = brands.find((b) => b.id === id);
    setBrandName(selectedBrand?.name || "");
  }}
  className="mt-1 block w-full border rounded px-3 py-2"
>
  <option value="">Select Brand </option>
  {brands.map((b) => (
    <option key={b.id} value={b.id}>
      {b.name}
    </option>
  ))}
</select>


        {/* Category Name */}
        <label className="block text-sm mt-4">Category Name <span className="text-red-500">*</span></label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />

        {/* Status */}
        {/* <label className="block text-sm mt-4">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option>Active</option>
          <option>Inactive</option>
        </select> */}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#BBF451] rounded text-black"
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
