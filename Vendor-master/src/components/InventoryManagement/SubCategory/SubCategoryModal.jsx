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
    setAllCategories(data);
    console.log(data)
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
      // Load all subcategories for duplicate check
      
      const allSubs = await subCategoryService.getAllSubCategories();

      const exists = allSubs.some(
        (sc) =>
          sc.categoryId === categoryId && // must be unique inside same category
          sc.name.trim().toLowerCase() === name.trim().toLowerCase() &&
          sc.id !== initialData?.id // allow editing same item
      );

      if (exists) {
        toast.error("Sub-category already exists in this category!");
        setSubmitting(false);
        return;
      }

      // Submit final payload
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
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Sub-Category" : "Add Sub-Category"}
        </h2>

        {/* Brand Dropdown */}
        <label className="block text-sm mt-4">Select Brand <span className="text-red-500">*</span></label>
        <select
          required
          value={brandId}
          onChange={(e) => {
            const id = e.target.value;
            setBrandId(Number(id));

            // FIX: Set brandName
            const selectedBrand = brands.find((b) => b.id === id);
            setBrandName(selectedBrand?.name || "");

            // RESET category + subcategory when brand changes
            setCategoryId("");
            setCategoryName("");
            setSubCategoryId("");
          }}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Category Dropdown */}
        <label className="block text-sm mt-4">Select Category <span className="text-red-500">*</span></label>
        <select
          required
          value={categoryId}
          onChange={(e) => {
            const id = e.target.value;
            setCategoryId(Number(id));

            // FIX: Set categoryName
            const selectedCat = allCategories.find((c) => c.id === id);
            setCategoryName(selectedCat?.name || "");

            // Reset subcategory when category changes
            setSubCategoryId("");
          }}
          className="mt-1 block w-full border rounded px-3 py-2"
          disabled={!brandId}
        >
          <option value="">Select Category</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sub-Category Name */}
        <label className="block text-sm mt-4">Sub-Category Name <span className="text-red-500">*</span></label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />

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
