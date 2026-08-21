


import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Sidebar } from "./Sidebar";
import { Header } from "../Dashboard/Header";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import io from "socket.io-client";
import API_BASE_URL from "../../config"; // ✅ correct import

const socket = io("http://65.1.108.78:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export const User = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" });
  const [formErrors, setFormErrors] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/getAllAdmins`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUsersData(data.admins);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "An error occurred while fetching admins.", "error");
    }
  };

  useEffect(() => {
    fetchAdmins();

    socket.on("adminAdded", () => {
      fetchAdmins();
      Swal.fire("Admin Added", "An admin was added by another user.", "info");
    });

    socket.on("adminUpdated", () => {
      fetchAdmins();
      Swal.fire("Admin Updated", "An admin was updated by another user.", "info");
    });

    socket.on("adminDeleted", () => {
      fetchAdmins();
      Swal.fire("Admin Deleted", "An admin was deleted by another user.", "info");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      Swal.fire("Connection Error", "Failed to connect to real-time updates.", "error");
    });

    return () => {
      socket.off("adminAdded");
      socket.off("adminUpdated");
      socket.off("adminDeleted");
      socket.off("connect_error");
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.role.trim()) errors.role = "Role is required";

    if (!editingUserId) {
      if (!formData.password.trim()) {
        errors.password = "Password is required";
      } else if (
        formData.password.length < 6 ||
        !/[a-z]/.test(formData.password) ||
        !/[A-Z]/.test(formData.password) ||
        !/\d/.test(formData.password)
      ) {
        errors.password = "Password must include uppercase, lowercase, and number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingUserId
        ? `${API_BASE_URL}/update-admin/${editingUserId}`
        : `${API_BASE_URL}/addRoleBasedAdmin`;

      const method = editingUserId ? "PUT" : "POST";
      const requestData = { ...formData };
      if (editingUserId && !requestData.password) delete requestData.password;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Success", editingUserId ? "Admin updated!" : "Admin created!", "success");
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "" });
        setShowPassword(false);
        await fetchAdmins();
        setEditingUserId(null);
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email, password: "", role: user.role });
    setEditingUserId(user.id);
    setFormErrors({});
    setShowModal(true);
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/delete-admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Deleted!", "Admin deleted successfully!", "success");
        setUsersData((prev) => prev.filter((user) => user.id !== id));
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch {
      Swal.fire("Error", "An error occurred. Please try again.", "error");
    }
  };

  const filteredUsers = [...usersData]
    .reverse()
    .filter((user) => selectedRole === "All" || user.role === selectedRole.toLowerCase());

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const tableRows = Array.from({ length: pageSize }, (_, index) => {
    const user = paginatedUsers[index];
    return user ? (
      <tr key={user.id || index} className="border-b hover:bg-gray-50">
        <td className="px-3 py-2 pl-6">{startIndex + index + 1}</td>
        <td className="px-3 py-2">{user.name}</td>
        <td className="px-2 py-2">{user.email}</td>
        <td className="px-2 py-2 capitalize">{user.role}</td>
        <td className="px-3 py-2 text-right">
          <button className="p-1.5 bg-yellow-500 text-white rounded m-1" onClick={() => handleEdit(user)}>
            <Pencil size={16} />
          </button>
          <button className="p-1.5 bg-red-500 text-white rounded m-1" onClick={() => handleDelete(user.id)}>
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    ) : (
      <tr key={`empty-${index}`} className="border-b">
        <td className="px-3 py-2 pl-6">{startIndex + index + 1}</td>
        <td className="px-3 py-2">-</td>
        <td className="px-2 py-2">-</td>
        <td className="px-2 py-2">-</td>
        <td className="px-3 py-2 text-right">-</td>
      </tr>
    );
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* <div className="flex h-screen bg-gray-100  ">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className={`flex flex-col w-full transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
          <Header className="h-10"isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /> */}
           <div className="flex flex-col md:flex-row h-screen bg-gray-100">
   <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main content area with dynamic margin based on sidebar state */}
      <div
        className={`flex-1  transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="p-0 space-y-0 "></div>
          <div className="bg-gradient-to-b from-blue-100 via-white to-blue-100 min-h-screen p-4">
            <div className="bg-gradient-to-b from-blue-100 via-white to-blue-50 backdrop-blur p-4 rounded-lg shadow-md w-full overflow-x-auto">
              <div className="flex  flex-col md:flex-row justify-between items-center mb-4">
                <h1 className="text-xl font-semibold mb-2 md:mb-0">User Management</h1>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-gray-700"
                  >
                    {/* <option value="All">All</option>
                    <option value="Vendor">Vendor</option>
                    <option value="User">User</option>
                    <option value="Support">Support</option> */}
                  </select>
                  <button
                    className="border border-gray-300 rounded px-3 py-1 bg-blue-500 text-white text-sm"
                    onClick={() => {
                      setShowModal(true);
                      setEditingUserId(null);
                      setFormErrors({});
                      setFormData({ name: "", email: "", password: "", role: "" });
                      setShowPassword(false);
                    }}
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                Showing {Math.min(filteredUsers.length, paginatedUsers.length)} of {filteredUsers.length} users
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-b from-blue-200 via-white to-blue-100 text-left">
                    <th className="px-3 py-2 pl-6">S. No.</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>{tableRows}</tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === 1 ? "hidden" : ""
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === index + 1 ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        currentPage === totalPages ? "hidden" : ""
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingUserId ? "Edit Admin" : "Create Admin"}</h2>

            <label className="block text-sm mb-1">Enter Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              className="w-full p-2 border rounded mb-1 bg-white"
            />
            {formErrors.name && <p className="text-red-500 text-xs mb-2">{formErrors.name}</p>}

            <label className="block text-sm mb-1">Enter Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded mb-1 bg-white"
            />
            {formErrors.email && <p className="text-red-500 text-xs mb-2">{formErrors.email}</p>}

            <label className="block text-sm mb-1">Enter Password</label>
            <div className="relative mb-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={editingUserId ? "New Password (optional)" : "Password"}
                className="w-full p-2 border rounded bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && <p className="text-red-500 text-xs mb-2">{formErrors.password}</p>}

            <label className="block text-sm mb-1">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded mb-2 bg-white"
            >
              <option value="">Select Role</option>
              <option value="admin">admin</option>
              {/* <option value="user">User</option>
              <option value="support">Support</option> */}
            </select>
            {formErrors.role && <p className="text-red-500 text-xs mb-2">{formErrors.role}</p>}

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  editingUserId ? "Update" : "Create"
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default User;
