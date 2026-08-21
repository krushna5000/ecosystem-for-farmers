import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import FarmTable from "../components/Farm/FarmTable";
import AppLoader from "../components/Loaders/AppLoader";
import AddFarmPage from "../components/Farm/AddFarmPage";
import React, { useEffect, useRef, useState } from "react";
import ConfirmationPopup from "../components/ConfirmationPopup";

export default function FarmManagement() {
  const formRef = useRef(null);
  const { user, loading } = useAuth();
  const [farms, setFarms] = useState([]);
  const domain = import.meta.env.VITE_DOMAIN;
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const fetchUserFarms = async () => {
    if (!user) return;

    try {
      const res = await axios.get(`${domain}/farms/get-farms/${user.id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setFarms(res.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load farms");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUserFarms();
    }
  }, [loading, user]);

  // Add
  const handleAddFarm = () => {
    fetchUserFarms();
  };

  // Edit
  const handleEditFarm = (farm) => {
    setEditingFarm(farm);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const confirmDeleteFarm = async () => {
    if (!farmToDelete) return;

    try {
      const res = await axios.delete(
        `${domain}/farms/delete-farm/${farmToDelete.id}`,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Farm deleted successfully");
        fetchUserFarms();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete farm");
    } finally {
      setShowDeletePopup(false);
      setFarmToDelete(null);
    }
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setFarmToDelete(null);
  };

  // Delete
  const handleDeleteClick = (farm) => {
    setFarmToDelete(farm);
    setShowDeletePopup(true);
  };

  if (!farms) {
    <AppLoader />;
  }

  return (
    <div className="md:px-6 space-y-4">
      <AddFarmPage
        ref={formRef}
        onAddFarm={handleAddFarm}
        editingFarm={editingFarm}
        clearEditing={() => setEditingFarm(null)}
      />
      <FarmTable
        farms={farms}
        onEditFarm={handleEditFarm}
        onDeleteFarm={handleDeleteClick}
      />

      <ConfirmationPopup
        isOpen={showDeletePopup}
        onClose={closeDeletePopup}
        onConfirm={confirmDeleteFarm}
        title="Delete Farm"
        message={`Are you sure you want to delete "${farmToDelete?.farm_name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
}
