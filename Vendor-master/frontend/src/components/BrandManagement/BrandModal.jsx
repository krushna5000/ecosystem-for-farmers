import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModalWrapper from "../ModalWrapper";

export default function BrandModal({ open, onClose, onSubmit, initialData }) {
  const isEdit = Boolean(initialData);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Prefill form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");       // use 'name' as per mapBrand
      setStatus(initialData.status || "Active");
      setPreview(initialData.logoUrl || null);
    } else {
      setName("");
      setStatus("Active");
      setPreview(null);
    }
    setFile(null);
  }, [initialData, open]);

  // Show preview for uploaded file
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  // Submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        status,
        logoFile: file, // send file as "logoFile"
      });

      toast.success(isEdit ? "Brand updated" : "Brand created");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Brand" : "Add Brand"}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Logo Preview */}
          <div className="mx-auto sm:mx-0">
            <div className="w-24 h-24 rounded-full border overflow-hidden bg-gray-100">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Logo
                </div>
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="flex-1">
            <label className="block text-sm">Upload Logo <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-blue-700"
            />

            <label className="block text-sm mt-4">Brand Name<span className="text-red-500">*</span></label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <label className="block text-sm mt-4">Status <span className="text-red-500">*</span></label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="border px-4 py-2">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#BBF451] px-4 py-2 rounded"
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
