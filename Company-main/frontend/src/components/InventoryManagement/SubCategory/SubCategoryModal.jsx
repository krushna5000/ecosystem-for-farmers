import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper";
import toast from "react-hot-toast";
import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as subCategoryService from "../../../api/InventoryManagementApis/subcategory.service";

export default function SubCategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
}) {
  const isEdit = Boolean(initialData);

  const [brands, setBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [subCategoryId, setSubCategoryId] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");

  const [submitting, setSubmitting] = useState(false);

  // ----------------------------
  // Load brands & categories
  // ----------------------------
  useEffect(() => {
    loadBrands();
    loadCategories();
  }, []);

  async function loadBrands() {
    const data = await brandService.getAllBrands();
    setBrands(data);
  }

  async function loadCategories() {
    const data = await categoryService.getAllCategories();
    setAllCategories(data || []);
  }

  // ----------------------------
  // Load editing data
  // ----------------------------
  useEffect(() => {
    if (initialData) {
      setBrandId(initialData.brandId);
      setBrandName(initialData.brandName);

      setCategoryId(initialData.categoryId);
      setCategoryName(initialData.categoryName);

      setName(initialData.name);
      setStatus(initialData.status);
    } else {
      setBrandId("");
      setBrandName("");
      setCategoryId("");
      setCategoryName("");
      setName("");
      setStatus("Active");
    }
  }, [initialData, open]);

  // ----------------------------
  // Filter categories by brand
  // ----------------------------
  const filteredCategories = brandId
    ? allCategories.filter((c) => c.brandId === Number(brandId))
    : [];

  // ----------------------------
  // SUBMIT HANDLER
  // ----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        brandId,
        brandName,
        categoryId,
        categoryName,
        name: name.trim(),
        status,
        createdAt: initialData?.createdAt,
      });

      toast.success(isEdit ? "Sub-category updated!" : "Sub-category created!");
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
            {isEdit ? "Edit Sub-Category" : "Add Sub-Category"}
          </h2>
          <p className="text-sm text-gray-500">
            Map sub-category under brand and category
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Brand Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Brand <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              required
              value={brandId}
              onChange={(e) => {
                const id = e.target.value;
                setBrandId(Number(id));

                const selectedBrand = brands.find((b) => b.id === id);
                setBrandName(selectedBrand?.name || "");

                setCategoryId("");
                setCategoryName("");
                setSubCategoryId("");
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

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Category <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => {
                const id = e.target.value;
                setCategoryId(Number(id));

                const selectedCat = allCategories.find((c) => c.id === id);
                setCategoryName(selectedCat?.name || "");

                setSubCategoryId("");
              }}
              disabled={!brandId}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-300 cursor-pointer"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub-Category Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sub-category name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
            />
          </div>
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
              : "Add Sub-Category"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
