import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import CropTable from "../components/Crop/CropTable";
import AddCropPage from "../components/Crop/AddCropPage";
import React, { useEffect, useRef, useState } from "react";
import ConfirmationPopup from "../components/ConfirmationPopup";

export default function CropManagement() {
  const formRef = useRef(null);
  const { user, loading } = useAuth();
  const [crops, setCrops] = useState([]);
  const domain = import.meta.env.VITE_DOMAIN;
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropToDelete, setCropToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const fetchUserCrops = async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        `${domain}/farms/get-farm-crops-by-user/${user.id}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setCrops(res.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load crops");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUserCrops();
    }
  }, [loading, user]);

  // Add
  const handleAddCrop = () => {
    fetchUserCrops();
  };

  // Edit
  const handleEditCrop = (crop) => {
    setEditingCrop(crop);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const confirmDeleteCrop = async () => {
    if (!cropToDelete) return;

    try {
      const res = await axios.delete(
        `${domain}/farms/delete-farm-crop/${cropToDelete.farm_crop_id}`,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Crop deleted successfully");
        fetchUserCrops();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete crop");
    } finally {
      setShowDeletePopup(false);
      setCropToDelete(null);
    }
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setCropToDelete(null);
  };

  // Delete
  const handleDeleteClick = (crop) => {
    setCropToDelete(crop);
    setShowDeletePopup(true);
  };

  return (
    <div className="md:px-6 text-white">
      <AddCropPage
        ref={formRef}
        onAddCrop={handleAddCrop}
        editingCrop={editingCrop}
        clearEditing={() => setEditingCrop(null)}
      />
      <CropTable
        crops={crops}
        onEditCrop={handleEditCrop}
        onDeleteCrop={handleDeleteClick}
      />

      <ConfirmationPopup
        isOpen={showDeletePopup}
        onClose={closeDeletePopup}
        onConfirm={confirmDeleteCrop}
        title="Delete Farm"
        message={`Are you sure you want to delete "${cropToDelete?.crop_name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
