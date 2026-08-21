import React, { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";

import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  toggleVendorStatus,
} from "../api/vendorApi.service";

import ConfirmationPopup from "../Components/ConfirmationPopup";

function VendorManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [currentVendorId, setCurrentVendorId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteVendorId, setDeleteVendorId] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isViewCardOpen, setIsViewCardOpen] = useState(false);
  const [viewVendor, setViewVendor] = useState(null);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    phone: "",
    shop_act_no: "",
    shop_act_pdf: null,
    gst_no: "",
    gst_pdf: null,
    licence_no: "",
    licence_pdf: null,
    pan_no: "",
    pan_pdf: null,
  };

  const [formData, setFormData] = useState(emptyForm);

  const loadVendors = async () => {
    try {
      const result = await getVendors();
      setVendors(result.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vendors");
      setVendors([]);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (isEditing) {
        await updateVendor(currentVendorId, data);
        toast.success("Vendor updated successfully");
      } else {
        await createVendor(data);
        toast.success("Vendor created successfully");
      }

      setIsOpen(false);
      setIsEditing(false);
      setFormData(emptyForm);
      loadVendors();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const fieldErrors = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        toast.error(fieldErrors);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to save vendor");
      }
    }
  };

  const handleEditClick = (vendor) => {
    setIsEditing(true);
    setIsOpen(true);

    setFormData({
      name: vendor.name || "",
      email: vendor.email || "",
      password: "",
      phone: vendor.phone || "",
      shop_act_no: vendor.shop_act_no || "",
      shop_act_pdf: vendor.shop_act_pdf || null,
      gst_no: vendor.gst_no || "",
      gst_pdf: vendor.gst_pdf || null,
      licence_no: vendor.licence_no || "",
      licence_pdf: vendor.licence_pdf || null,
      pan_no: vendor.pan_no || "",
      pan_pdf: vendor.pan_pdf || null,
    });

    setCurrentVendorId(vendor.id);
  };

  const handleDeleteClick = async (vendorId) => {
    try {
      await deleteVendor(vendorId);
      toast.success("Vendor deleted successfully");
      setIsDeletePopupOpen(false);
      setDeleteVendorId(null);
      loadVendors();
    } catch (err) {
      console.error("Delete failed:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to delete vendor");
      }
    }
  };

  const handleToggleStatus = async (vendor) => {
    try {
      const res = await toggleVendorStatus(vendor.id);

      const updatedStatus =
        res.data?.data?.is_active ??
        res.data?.data?.vendor?.is_active ??
        res.data?.vendor?.is_active ??
        res.data?.is_active;

      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id ? { ...v, is_active: updatedStatus } : v
        )
      );

      if (updatedStatus) {
        toast.success("Vendor activated successfully");
      } else {
        toast.error("Vendor inactivated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update vendor status");
    }
  };

  // FILTERED DATA FOR SEARCH
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(filterText.toLowerCase());

      const matchesStatus =
        statusFilter === ""
          ? true
          : statusFilter === "Active"
          ? vendor.is_active
          : !vendor.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, filterText, statusFilter]);

  // DATATABLE COLUMNS
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "100px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "180px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
      width: "120px",
    },
    {
      name: "Shop Act No",
      selector: (row) => row.shop_act_no,
      sortable: true,
      width: "150px",
      cell: (row) =>
        row.shop_act_no ? (
          row.shop_act_pdf ? (
            <a
              href={row.shop_act_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.shop_act_no}
            </a>
          ) : (
            row.shop_act_no
          )
        ) : (
          "-"
        ),
    },
    {
      name: "GST No",
      selector: (row) => row.gst_no,
      sortable: true,
      width: "150px",
      cell: (row) =>
        row.gst_no ? (
          row.gst_pdf ? (
            <a
              href={row.gst_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.gst_no}
            </a>
          ) : (
            row.gst_no
          )
        ) : (
          "-"
        ),
    },
    {
      name: "Licence No",
      selector: (row) => row.licence_no,
      sortable: true,
      width: "150px",
      cell: (row) =>
        row.licence_no ? (
          row.licence_pdf ? (
            <a
              href={row.licence_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.licence_no}
            </a>
          ) : (
            row.licence_no
          )
        ) : (
          "-"
        ),
    },
    {
      name: "PAN No",
      selector: (row) => row.pan_no,
      sortable: true,
      width: "120px",
      cell: (row) =>
        row.pan_no ? (
          row.pan_pdf ? (
            <a
              href={row.pan_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {row.pan_no}
            </a>
          ) : (
            row.pan_no
          )
        ) : (
          "-"
        ),
    },
    {
      name: "Status",
      sortable: true,
      width: "160px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-semibold ${
              row.is_active ? "text-green-600" : "text-red-600"
            }`}
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>

          <StatusToggle
            isActive={row.is_active}
            onClick={() => handleToggleStatus(row)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },

    {
      name: "Actions",
      width: "130px",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewVendor(row);
              setIsViewCardOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-green-600" />
          </button>

          <button onClick={() => handleEditClick(row)}>
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => {
              setDeleteVendorId(row.id);
              setIsDeletePopupOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#cbff2e",
        color: "#000",
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#cbff2e",
      },
    },
  };

  const StatusToggle = ({ isActive, onClick }) => {
    return (
      <button
        onClick={onClick}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300
      ${isActive ? "bg-green-500" : "bg-gray-300"}`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
        ${isActive ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
          Vendor Management
        </h1>
        <p className="text-gray-500 mt-1">Manage all Vendors here...</p>
      </div>

      {/* HEADER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email..."
            className="border px-3 py-2 rounded w-full sm:w-64"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-3">
          <select
            className="bg-white text-black border px-3 py-2 rounded w-full sm:w-30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-[#cbff2e] hover:bg-[#baff00] transition-all font-semibold text-gray-900 py-2 px-3 sm:py-2 sm:px-4 rounded-md shadow-md active:scale-95 w-auto"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline whitespace-nowrap">
            Create Vendor
          </span>
        </button>
      </div>

      <div className="overflow-x-auto mt-8">
        <div className="min-w-[700px]">
          <DataTable
            columns={columns}
            data={filteredVendors}
            pagination
            highlightOnHover
            striped
            persistTableHead
            noDataComponent="No vendor found."
            responsive={true}
            customStyles={customStyles}
          />
        </div>
      </div>

      {/* POPUP FORM */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl p-6 relative max-h-[80vh] overflow-auto">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsEditing(false);
                setFormData(emptyForm);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-center mb-5">
              {isEditing ? "Update Vendor" : "Create Vendor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const regex = /^[A-Za-z\s]*$/;
                    if (regex.test(e.target.value)) {
                      setFormData({ ...formData, name: e.target.value });
                    }
                  }}
                  required
                  placeholder="Enter Vendor Name"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="Enter email"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      minLength={6}
                      className="w-full border rounded-lg px-3 py-2 pr-10"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Phone No
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const regex = /^[0-9]*$/;
                    if (regex.test(e.target.value)) {
                      setFormData({ ...formData, phone: e.target.value });
                    }
                  }}
                  pattern="[6-9][0-9]{9}"
                  placeholder="Enter Phone No"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Shop Act No (16 Digit No)
                </label>
                <input
                  type="text"
                  value={formData.shop_act_no}
                  placeholder="Enter Shop Act No"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shop_act_no: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Shop Act PDF
                </label>
                <div className="relative mt-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          shop_act_pdf: file,
                          shop_act_pdf_preview: URL.createObjectURL(file), // Live preview
                        });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 pr-28"
                  />
                  {(formData.shop_act_pdf_preview ||
                    (isEditing &&
                      typeof formData.shop_act_pdf === "string")) && (
                    <a
                      href={
                        formData.shop_act_pdf_preview
                          ? formData.shop_act_pdf_preview
                          : formData.shop_act_pdf
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Preview PDF
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  GST No (Ex. 27ABCDE1234F1Z5)
                </label>
                <input
                  type="text"
                  value={formData.gst_no}
                  placeholder="Enter GST No"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gst_no: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$"
                  title="GSTIN must be 15 characters: 2-digit state code, 10-character PAN, 1-digit entity number, 'Z', and 1 checksum character."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  GST PDF
                </label>

                <div className="relative mt-1">
                  {/* File input */}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          gst_pdf: file,
                          gst_pdf_preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 pr-28"
                  />

                  {(formData.gst_pdf_preview ||
                    (isEditing && typeof formData.gst_pdf === "string")) && (
                    <a
                      href={
                        formData.gst_pdf_preview
                          ? formData.gst_pdf_preview
                          : formData.gst_pdf
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Preiew PDF
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Licence No (Ex. MH1420110062821)
                </label>
                <input
                  type="text"
                  value={formData.licence_no}
                  placeholder="Enter Licence No"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licence_no: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 "
                  required
                  pattern="^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$"
                  title="Licence No must be 13 characters: 2 letters (state) + 2 digits (RTO code) + 4 digits (year) + 7 digits (unique ID). Example: MH1420110062821"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Licence PDF
                </label>

                <div className="relative mt-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          licence_pdf: file,
                          licence_pdf_preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 pr-24"
                  />
                  {(formData.licence_pdf_preview ||
                    (isEditing &&
                      typeof formData.licence_pdf === "string")) && (
                    <a
                      href={
                        formData.licence_pdf_preview
                          ? formData.licence_pdf_preview
                          : formData.licence_pdf
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Preview PDF
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  PAN No (Ex. AFZPK7190K)
                </label>
                <input
                  type="text"
                  value={formData.pan_no}
                  placeholder="Enter PAN No"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pan_no: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2"
                  required
                  pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
                  title="PAN No must be 10 characters: 5 letters + 4 digits + 1 letter. Example: AFZPK7190K"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  PAN PDF
                </label>

                <div className="relative mt-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          pan_pdf: file,
                          pan_pdf_preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 pr-28"
                  />
                  {(formData.pan_pdf_preview ||
                    (isEditing && typeof formData.pan_pdf === "string")) && (
                    <a
                      href={
                        formData.pan_pdf_preview
                          ? formData.pan_pdf_preview
                          : formData.pan_pdf
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Preview PDF
                    </a>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#cbff2e] hover:bg-[#baff00] text-gray-900 font-semibold py-2 rounded-lg shadow-md"
              >
                {isEditing ? "Update Vendor" : "Create Vendor"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {isDeletePopupOpen && (
        <ConfirmationPopup
          isOpen={isDeletePopupOpen}
          onClose={() => setIsDeletePopupOpen(false)}
          onConfirm={() => {
            if (deleteVendorId) handleDeleteClick(deleteVendorId);
          }}
          message="Are you sure you want to delete this vendor?"
          title="Delete Vendor"
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      )}

      {isViewCardOpen && viewVendor && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 relative">

      {/* CLOSE */}
      <button
        onClick={() => setIsViewCardOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        <X className="w-5 h-5" />
      </button>

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {viewVendor.name}
        </h2>
        <p className="text-sm text-gray-500">{viewVendor.email}</p>
      </div>

      {/* STATUS */}
      <div className="mb-4">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            viewVendor.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {viewVendor.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* DETAILS */}
      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Phone:</strong> {viewVendor.phone || "-"}</p>
        <p><strong>Shop Act:</strong> {viewVendor.shop_act_no || "-"}</p>
        <p><strong>GST:</strong> {viewVendor.gst_no || "-"}</p>
        <p><strong>Licence:</strong> {viewVendor.licence_no || "-"}</p>
        <p><strong>PAN:</strong> {viewVendor.pan_no || "-"}</p>
      </div>

      {/* FILE LINKS */}
      <div className="mt-4 space-y-2">
        {viewVendor.shop_act_pdf && (
          <a
            href={viewVendor.shop_act_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm block"
          >
            View Shop Act PDF
          </a>
        )}

        {viewVendor.gst_pdf && (
          <a
            href={viewVendor.gst_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm block"
          >
            View GST PDF
          </a>
        )}

        {viewVendor.licence_pdf && (
          <a
            href={viewVendor.licence_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm block"
          >
            View Licence PDF
          </a>
        )}

        {viewVendor.pan_pdf && (
          <a
            href={viewVendor.pan_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm block"
          >
            View PAN PDF
          </a>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default VendorManagement;
