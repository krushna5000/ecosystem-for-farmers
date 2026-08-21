import React, { useEffect, useState } from "react";
import AdminTable from "../components/UserManagement/AdminTable";
import AdminHeader from "../components/UserManagement/AdminHeader";
import ConfirmationPopup from "../components/ConfirmationPopup";
import CreateAdmin from "../components/UserManagement/CreateAdmin";
import { domain } from "../utils/domain";
import toast from "react-hot-toast";
import axios from "axios";

export default function UserManagement() {
  const [admins, setAdmins] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAdminId, setEditAdminId] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${domain}/admin`, {
        withCredentials: true,
      });

      setAdmins(response.data.data); //storing admins data
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    console.log(formData);
    try {
      if (isEditing) {
        // Edit request
        const updatedData = { ...formData };

        if (!updatedData.password) {
          delete updatedData.password;
        }

        const response = await axios.put(
          `${domain}/admin/${editAdminId}`,
          updatedData,
          {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.status === 200) {
          toast.success("Admin Updated!");
          setIsPopupOpen(!isPopupOpen);
          setFormData({ name: "", email: "" });
          setIsEditing(false);
          fetchAdmins();
        }
      } else {
        // create request
        const response = await axios.post(`${domain}/admin`, formData, {
          withCredentials: true,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 201) {
          toast.success("Admin Created!");
          fetchAdmins();

          setIsPopupOpen(false);
          setFormData({ name: "", email: "", password: "" });
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response.data.message);
      }
    }
  };

  // edit
  const handleEditClick = (admin) => {
    setIsEditing(true);
    setEditAdminId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: admin.password,
    });
    setIsPopupOpen(true);
  };

  // delete
  const handleDeleteClick = (admin) => {
    setDeleteAdmin(admin);
    setIsConfirmOpen(true);
  };

  // View Admin
  const handleViewClick = (admin) => {
    console.log(admin);
  };

  // Admin delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`${domain}/admin/${deleteAdmin.id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setAdmins((prev) => prev.filter((a) => a.id !== deleteAdmin.id));
        toast.success("Admin deleted!");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsConfirmOpen(false);
      setDeleteAdmin(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden">
        <AdminHeader onCreateClick={() => setIsPopupOpen(true)} />

        <AdminTable
          admins={admins}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onViewClick={handleViewClick}
          fetchAdmins={fetchAdmins}
        />

        <CreateAdmin
          isOpen={isPopupOpen}
          onClose={() => {
            setIsEditing(false);
            setEditAdminId(null);
            setFormData({ name: "", email: "", password: "" });
            setIsPopupOpen(!isPopupOpen);
          }}
          onSubmit={handleCreateAdmin}
          formData={formData}
          setFormData={setFormData}
          isEditing={isEditing}
        />

        <ConfirmationPopup
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Admin"
          message={`Are you sure you want to delete ${deleteAdmin?.name}? This action cannot be undone.`}
          confirmText="Delete"
          confirmColor="bg-red-600 hover:bg-red-700"
        />
      </div>
    </>
  );
}
