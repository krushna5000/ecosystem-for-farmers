import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModalWrapper from "../ModalWrapper";
import * as brandService from "../../api/InventoryManagementApis/brand.service";

export default function BrandModal({ open, onClose, onSubmit, initialData }) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setPreview(initialData.logoUrl || null);
      setFile(null);
    } else {
      setName("");
      setStatus("Active");
      setPreview(null);
      setFile(null);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        status,
        logoFile: file,
      });

      toast.success(isEdit ? "Brand updated!" : "Brand created!");
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
            {isEdit ? "Edit Brand" : "Add Brand"}
          </h2>
          <p className="text-sm text-gray-500">
            Enter brand details and upload logo
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">Logo</span>
              )}
            </div>

            <label className="cursor-pointer text-sm text-blue-600 hover:underline">
              Upload Logo <span className="text-red-500" aria-hidden="true">*</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-2 space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter brand name"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-lime-300 cursor-pointer"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
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
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Brand"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
