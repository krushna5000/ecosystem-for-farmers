import React, { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import {
  getCompanies,
  createCompany,
  deleteCompany,
  getCompanyTypes,
  toggleCompanyStatus,
  updateCompany,
} from "../api/companyApi.service";

import ConfirmationPopup from "../Components/ConfirmationPopup";

function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [deleteCompanyId, setDeleteCompanyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewCompany, setViewCompany] = useState(null);

const emptyForm = {
    company_type_id: "",
    company_type_name: "",
    email: "",
    password: "",
    llp_no: "",
    cin_no: "",
    name: "",
    address: "",
    gst_no: "",
    phone: "",
    logo: null,
    is_active: true,
  };

  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompanies();
  }, [refreshTrigger]);

  const handleCreateClick = () => {
    setFormData(emptyForm);
    setIsOpen(true);
    setIsEditing(false);
  };

  const handleEditClick = (company) => {
    setFormData({
      ...company,
      company_type_name:
        company.company_type_name || company.company_type?.type || "",
      company_type_id:
        company.company_type_id || company.company_type?.id || "",
      logo: null, // Don't send file for edit unless changed
      is_active: company.is_active,
    });
    setLogoPreview(company.logo_url || null);
    setEditingCompanyId(company.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo size must be less than 5MB");
        return;
      }
      // Validate image type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, logo: null });
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (formData.logo) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        // Backend expects company_type as integer; avoid passing "".
        formDataToSend.append(
          "company_type",
          formData.company_type_id === "" ? "" : formData.company_type_id
        );
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("llp_no", formData.llp_no);
        formDataToSend.append("cin_no", formData.cin_no);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("gst_no", formData.gst_no);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("logo", formData.logo);

        payload = formDataToSend;
      } else {
      
        payload = {
          ...formData,
          company_type: formData.company_type_id === "" ? null : formData.company_type_id,
          logo: null,
        };
      }

      if (isEditing) {
        await updateCompany(editingCompanyId, payload);
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === editingCompanyId
              ? {
                  ...c,
                  ...formData,
                  company_type_name: formData.company_type_name,
                  logo_url: c.logo_url, // Preserve existing logo
                }
              : c
          )
        );
        toast.success("Company Updated!");
      } else {
        await createCompany(payload);
        toast.success("Company Created!");
        setRefreshTrigger((prev) => prev + 1);
      }

      setIsOpen(false);
      setIsEditing(false);
      setEditingCompanyId(null);
      setFormData(emptyForm);
      setLogoPreview(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (companyId) => {
    setDeleteCompanyId(companyId);
    setIsDeletePopupOpen(true);
  };

  const handleViewClick = (company) => {
    setViewCompany(company);
    setIsViewOpen(true);
  };

  const confirmDeleteCompany = async () => {
    setLoading(true);
    try {
      await deleteCompany(deleteCompanyId);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteCompanyId));
      toast.success("Company Deleted!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete company");
    } finally {
      setLoading(false);
      setIsDeletePopupOpen(false);
      setDeleteCompanyId(null);
    }
  };

  const handleToggleStatus = async (company) => {
    try {
      const res = await toggleCompanyStatus(company.id);

      const updatedStatus = res.data.data.is_active;

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...c, is_active: updatedStatus } : c
        )
      );

      if (updatedStatus) {
        toast.success("Company activated successfully");
      } else {
        toast.error("Company inactivated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update company status");
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesText =
        c.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        c.email?.toLowerCase().includes(filterText.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
          ? c.is_active === true
          : c.is_active === false;

      return matchesText && matchesStatus;
    });
  }, [companies, filterText, statusFilter]);

  const columns = [
    {
      name: "Logo",
      width: "80px",
      cell: (row) => (
        <div className="flex flex-col items-center gap-1">
          {row.logo_url ? (
            <>
              <img
                src={row.logo_url}
                alt={row.name}
                className="w-12 h-16 object-contain "
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </>
          ) : (
            <div className="w-12 h-12 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No Logo</span>
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: "Company Type",
      selector: (row) => row.company_type_name || row.company_type?.type || "-",
      sortable: true,
    },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "LLP No", selector: (row) => row.llp_no || "-", sortable: true },
    { name: "CIN No", selector: (row) => row.cin_no || "-", sortable: true },
    { name: "GST No", selector: (row) => row.gst_no || "-", sortable: true },
    {
      name: "Status",
      sortable: true,
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
    },
    {
      name: "Actions",
      width: "100px",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewClick(row)}
            className="text-green-600 hover:text-green-800"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className={`text-red-600 hover:text-red-800 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
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
          Company Management
        </h1>
        <p className="text-gray-500 mt-1">Manage all companies here...</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 sm:gap-0">
        <div className="flex-1 mr-4">
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
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-[#cbff2e] hover:bg-[#baff00] transition-all font-semibold text-gray-900 py-1 px-2 sm:py-2 sm:px-4 rounded-md shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="inline">Create Company</span>
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto max-w-full mt-8">
        <div className="min-w-[700px]">
          <DataTable
            columns={columns}
            data={filteredCompanies}
            pagination
            highlightOnHover
            striped
            noDataComponent="No company found."
            responsive={true}
            customStyles={customStyles}
            persistTableHead
          />
        </div>
      </div>

      {/* POPUP FORM */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
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
              {isEditing ? "Update Company" : "Create Company"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* COMPANY TYPE */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600">
                  Company Type
                </label>
                <input
                  type="text"
                  value={formData.company_type_name}
                  onClick={async () => {
                    try {
                      const types = await getCompanyTypes();
                      setCompanyTypes(types);
                      setShowDropdown(true);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  placeholder="Select Company Type"
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-white cursor-pointer"
                  readOnly
                  required
                />
                {showDropdown && (
                  <ul className="absolute w-full bg-white border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                    {companyTypes.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            company_type_id: item.id,
                            company_type_name: item.type,
                          });
                          setShowDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {item.type}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CONDITIONAL FIELDS */}
              {(formData.company_type_name === "Public" ||
                formData.company_type_name === "Pvt") && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    CIN No (Ex. L01631KA2010PTC096843)
                  </label>
                  <input
                    type="text"
                    value={formData.cin_no}
                    placeholder="Enter CIN No"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cin_no: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 mt-1 "
                    required
                    pattern="^[LU]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$"
                    title="CIN must be 21 characters: L/U + 5 digits + 2 letters + 4 digits + 3 letters + 6 digits. Example: L01631KA2010PTC796843"
                    maxLength={21}
                  />
                </div>
              )}

              {formData.company_type_name === "LLP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    LLP No (Ex. AAF-8155){" "}
                  </label>
                  <input
                    type="text"
                    value={formData.llp_no}
                    placeholder="Enter LLP No"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        llp_no: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    required
                    pattern="^[A-Z]{3}-[0-9]{4}$"
                    title="LLP No must follow the format: 3 letters - 4 digits (Example: AAF-8155)"
                    maxLength={8}
                  />
                </div>
              )}

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
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder="Enter Company Name"
                  onChange={(e) => {
                    const regex = /^[A-Za-z\s]*$/;
                    if (regex.test(e.target.value))
                      setFormData({ ...formData, name: e.target.value });
                  }}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0 file:text-sm file:font-semibold
                             file:bg-[#cbff2e] file:text-gray-900 hover:file:bg-[#baff00]
                             border-gray-300"
                />
                {logoPreview && (
                  <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-24 h-24 object-contain rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logo Preview</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  placeholder="Enter Email"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
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
                      placeholder="Enter password"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2 pr-10"
                      required
                      minLength={6}
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
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  placeholder="Enter Phone No"
                  onChange={(e) => {
                    const regex = /^[0-9]*$/;
                    if (regex.test(e.target.value))
                      setFormData({ ...formData, phone: e.target.value });
                  }}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  placeholder="Enter Address"
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {" "}
                  Format: Village, City, District, Pincode, State, Country{" "}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#cbff2e] font-semibold py-2 px-4 rounded-md hover:bg-[#baff00] transition-all active:scale-95"
              >
                {isEditing ? "Update Company" : "Create Company"}
              </button>
            </form>
          </div>
        </div>
      )}

{/* View Button Functionality */}
      {isViewOpen && viewCompany && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">

    <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-md p-6 relative">

      <button
        onClick={() => setIsViewOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-5">
        Company Details
      </h2>

      <div className="space-y-3 text-sm">

        <div className="flex justify-center mb-4">
          {viewCompany.logo_url ? (
            <img
              src={viewCompany.logo_url}
              alt={viewCompany.name}
              className="w-32 h-32 object-contain rounded-lg border shadow-md"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-500 text-sm">No Logo</span>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Company Type:</span>
          <span>
            {viewCompany.company_type_name ||
              viewCompany.company_type?.type ||
              "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Company Name:</span>
          <span>{viewCompany.name}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Email:</span>
          <span>{viewCompany.email}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Phone:</span>
          <span>{viewCompany.phone}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">GST No:</span>
          <span>{viewCompany.gst_no || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">CIN No:</span>
          <span>{viewCompany.cin_no || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">LLP No:</span>
          <span>{viewCompany.llp_no || "-"}</span>
        </div>

        <div>
          <span className="font-semibold">Address:</span>
          <p className="text-gray-600">{viewCompany.address}</p>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Status:</span>
          <span
            className={
              viewCompany.is_active ? "text-green-600" : "text-red-600"
            }
          >
            {viewCompany.is_active ? "Active" : "Inactive"}
          </span>
        </div>

      </div>
    </div>

  </div>
)}

      <ConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        onConfirm={confirmDeleteCompany}
        title="Delete Company"
        message="Are you sure you want to delete this company?"
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default CompanyManagement;
