import React, { useEffect, useState } from "react";
import ModalWrapper from "../../ModalWrapper";
import toast from "react-hot-toast";

import * as brandService from "../../../api/InventoryManagementApis/brand.service";
import * as categoryService from "../../../api/InventoryManagementApis/catagory.service";
import * as subCategoryService from "../../../api/InventoryManagementApis/subcategory.service";
import * as cropService from "../../../api/InventoryManagementApis/crop.service.js";

export default function ProductModal({
  open,
  onClose,
  onSubmit,
  initialData,
  forceBrandId = null, // for brand-specific product page later
}) {
  const isEdit = Boolean(initialData);

  // DATA SOURCES
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // FORM FIELDS
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  // Chemical Composition (NPK)
  const [chemicalComposition, setChemicalComposition] = useState([
    { name: "", value: "", formulation: "" },
    // { name: "", value: "" },
    // { name: "", value: "" },
  ]);

  const [crops, setCrops] = useState([]);

  const [selectedCrops, setSelectedCrops] = useState([]);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);
  const [cropSearch, setCropSearch] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  function addChemical() {
    setChemicalComposition([
      ...chemicalComposition,
      { name: "", value: "", formulation: "" },
    ]);
  }

  function updateChemical(index, field, value) {
    const updated = [...chemicalComposition];
    updated[index][field] = value;
    setChemicalComposition(updated);
  }

  function removeChemical(index) {
    setChemicalComposition(chemicalComposition.filter((_, i) => i !== index));
  }

  function handleCropChange(e) {
    const values = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    setSelectedCrops(values);
  }

  function toggleCrop(id) {
  setSelectedCrops((prev) => {
    const updated = prev.includes(id)
      ? prev.filter((cropId) => cropId !== id)
      : [...prev, id];

    console.log("Updated Selected Crops:", updated);  // 🔥 DEBUG
    return updated;
  });
}

  const filteredCrops = Array.isArray(crops)
    ? crops.filter((crop) =>
        crop.crop_name?.toLowerCase().includes(cropSearch.toLowerCase()),
      )
    : [];

  // ------------------------------
  // LOAD LISTS
  // ------------------------------
  useEffect(() => {
    loadBrands();
    loadCategories();
    loadSubCategories();
    loadCrops();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".crop-dropdown")) {
        setCropDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  async function loadCrops() {
    try {
      const data = await cropService.getAllCrops();
      setCrops(data);
    } catch (error) {
      console.error("Error loading crops:", error);
      toast.error("Failed to load crops");
    }
  }

  // ------------------------------
  // LOAD INITIAL DATA (EDIT MODE)
  // ------------------------------
useEffect(() => {
  if (initialData) {
    setBrandId(Number(initialData.brandId));
    setCategoryId(Number(initialData.categoryId));
    setSubCategoryId(Number(initialData.subCategoryId));

    setName(initialData.name || "");
    setDescription(initialData.description || "");

    // ✅ Chemical Composition (safe array check)
    if (
      Array.isArray(initialData.chemicalComposition) &&
      initialData.chemicalComposition.length > 0
    ) {
      setChemicalComposition(initialData.chemicalComposition);
    } else {
      setChemicalComposition([{ name: "", value: "", formulation: "" }]);
    }

    // ✅ Set crop_ids properly
    if (Array.isArray(initialData.crop_ids)) {
      setSelectedCrops(initialData.crop_ids.map(Number));
    } else {
      setSelectedCrops([]);
    }

    setImagePreview(initialData.imageUrl || null);
    setImageFile(null);
  } else {
    // Reset form
    setBrandId(forceBrandId || "");
    setCategoryId("");
    setSubCategoryId("");

    setName("");
    setDescription("");

    setChemicalComposition([{ name: "", value: "", formulation: "" }]);
    setSelectedCrops([]);  // 🔥 IMPORTANT
    setImagePreview(null);
    setImageFile(null);
  }
}, [initialData, open]);

  // ------------------------------
  // FILTERED DROPDOWNS
  // ------------------------------
  const filteredCategories = brandId
    ? categories.filter((c) => c.brandId === Number(brandId))
    : [];

  const filteredSubCategories = categoryId
    ? subCategories.filter((s) => s.categoryId === Number(categoryId))
    : [];

  // ------------------------------
  // IMAGE PREVIEW
  // ------------------------------
  useEffect(() => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // ------------------------------
  // SUBMIT
  // ------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        brandId: Number(brandId),
        categoryId: Number(categoryId),
        subCategoryId: Number(subCategoryId),

        name: name.trim(),
        description: description.trim(),

       

        chemicalComposition: chemicalComposition.filter(
          (c) => c.name.trim() && c.value.trim(),
        ),
        crop_ids: Array.isArray(selectedCrops)
  ? selectedCrops
  : [selectedCrops],
        imageFile: imageFile || null,
      });

      toast.success(isEdit ? "Product updated!" : "Product created!");
      onClose();
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  }

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Product" : "Add Product"}
          </h2>
          <p className="text-sm text-gray-500">
            Assign product to brand, category and sub-category
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Brand<span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={Boolean(forceBrandId)}
              value={brandId}
              onChange={(e) => {
                setBrandId(Number(e.target.value));
                setCategoryId("");
                setSubCategoryId("");
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-300"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category<span className="text-red-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => {
                setCategoryId(Number(e.target.value));
                setSubCategoryId("");
              }}
              disabled={!brandId}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-300"
            >
              <option value="">Select Category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub-Category<span className="text-red-500">*</span>
            </label>
            <select
              required
              value={subCategoryId}
              onChange={(e) => {
                setSubCategoryId(Number(e.target.value));
                setSelectedCrops([]);
              }}
              disabled={!categoryId}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-lime-300"
            >
              <option value="">Select Sub-Category</option>
              {filteredSubCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name<span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-lime-300"
            />
          </div>
          {/* Crops Dropdown */}
          <div className="relative">
            {/* Crops Dropdown */}
            <div className="relative crop-dropdown">
              <label className="block text-sm font-medium text-gray-700">
                Applicable Crops<span className="text-red-500">*</span>
              </label>

              {/* Dropdown Button */}
              <div
                onClick={() => {
                  if (subCategoryId) {
                    setCropDropdownOpen(!cropDropdownOpen);
                  }
                }}
                className={`mt-1 w-full rounded-lg border px-4 py-2 flex justify-between items-center transition
    ${
      subCategoryId
        ? "bg-white border-gray-300 cursor-pointer hover:border-lime-400"
        : "bg-gray-100 border-gray-200 cursor-not-allowed text-black "
    }`}
              >
                <span className=" truncate">
                  {!subCategoryId
                    ? "Select Sub-Category first"
                    : selectedCrops.length > 0
                      ? crops
                          .filter((c) => selectedCrops.includes(c.id))
                          .map((c) => c.crop_name)
                          .join(", ")
                      : "Select Crops"}
                </span>

                <span className="text-gray-400">▼</span>
              </div>

              {/* Dropdown Menu */}
              {subCategoryId && cropDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
                  {/* Search Box */}
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search crops..."
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
                    />
                  </div>

                  {/* Crop List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCrops.length > 0 ? (
                      filteredCrops.map((crop) => (
                        <label
                          key={crop.id}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCrops.includes(crop.id)}
                            onChange={() => toggleCrop(crop.id)}
                            className="h-4 w-4 text-lime-500 border-gray-300 rounded focus:ring-lime-400"
                          />
                          {crop.crop_name}
                        </label>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        No crops found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
          </div>
          {/* Chemical Composition */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chemical Composition<span className="text-red-500">*</span>
            </label>

            <div className="space-y-3 mt-2">
              {(Array.isArray(chemicalComposition)
  ? chemicalComposition
  : []
).map((chem, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Chemical Name */}
                  <input
                    type="text"
                    placeholder="Chemical name"
                    value={chem.name}
                    onChange={(e) =>
                      updateChemical(index, "name", e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
                  />

                  <span className="text-gray-500 font-medium">:</span>

                  {/* Value */}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Value"
                    value={chem.value}
                    onChange={(e) =>
                      updateChemical(index, "value", e.target.value)
                    }
                    className="w-17 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
                  />

                  {/* Formulation (free text, optional) */}
                  <input
                    type="text"
                    placeholder="Formulation (optional)"
                    value={chem.formulation}
                    onChange={(e) =>
                      updateChemical(index, "formulation", e.target.value)
                    }
                    className="w-30 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
                  />

                  {/* Remove */}
                  {chemicalComposition.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChemical(index)}
                      className="text-red-500 text-lg px-2"
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* Add button */}
              <button
                type="button"
                onClick={addChemical}
                className="text-sm text-green-600 hover:underline"
              >
                + Add chemical
              </button>
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Image<span className="text-red-500">*</span>
            </label>

            <div className="mt-2 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>

              <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[#BBF451] text-black font-medium hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
