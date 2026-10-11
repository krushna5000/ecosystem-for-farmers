import React, { useEffect, useState } from "react";

import AddButton from "./LocationComponents/AddButton";
import FormModal from "./LocationComponents/FormModal";
import DataTable from "./LocationComponents/DataTable";
import ConfirmationPopup from "../ConfirmationPopup";
import toast from "react-hot-toast";
import { onToggle } from "../../api/location/onToggle";

import { getAllCities } from "../../api/location/city.service";
import {
  getAllVillages,
  createVillage,
  updateVillage,
  deleteVillage,
} from "../../api/location/village.service";

const VillageManagement = () => {
  const [cityList, setCityList] = useState([]);
  const [villageList, setVillageList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState(null);

  // -------------------------
  // Load Cities (Dropdown)
  // -------------------------
  const loadCities = async () => {
    try {
      const data = await getAllCities();
      setCityList(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // -------------------------
  // Load Villages (Table)
  // -------------------------
  const loadVillages = async () => {
    try {
      const data = await getAllVillages();
      const formatted = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString("en-GB"),
        updated_at: new Date(item.updated_at).toLocaleDateString("en-GB"),
      }));
      setVillageList(formatted);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const fetchData = () => {
    loadCities();
    loadVillages();
  };

  useEffect(() => {
    fetchData;
  }, []);

  // -------------------------
  // Add or Update Village
  // -------------------------
  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        const response = await updateVillage(editData.village_id, {
          city_id: formData.city_id,
          village_name: formData.village_name,
        });

        if (response.success) {
          toast.success("Village updated!");
          loadVillages();
          setShowConfirm(false);
        }
      } else {
        const response = await createVillage({
          city_id: formData.city_id,
          village_name: formData.village_name,
        });
        if (response.success) {
          toast.success("Village creates!");
          loadVillages();
          setShowConfirm(false);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // -------------------------
  // Delete Village
  // -------------------------
  const handleDeleteClick = (village) => {
    setVillageToDelete(village);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteVillage(villageToDelete);

      if (response.success) {
        toast.success("village deleted!");
        loadVillages();
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // -------------------------
  // Modal Fields (snake_case)
  // -------------------------
  const modalFields = [
    {
      name: "city_id",
      label: "Select City",
      type: "select",
      options: cityList
        .filter((c) => c.is_active)
        .map((c) => ({
          id: c.city_id,
          name: c.city_name,
        })),
    },
    {
      name: "village_name",
      label: "Village Name",
      type: "text",
      onlyAlphabets: true,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Village Management</h1>
          <p className="text-gray-600 mb-6">
            Manage or create all Village entries
          </p>
        </div>

        <AddButton
          label="Add Village"
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        />
      </div>

      {/* TABLE (Backend-Correct) */}
      <DataTable
        columns={[
          { label: "ID", key: "village_id" },
          { label: "City Name", key: "city_name" },
          { label: "Village Name", key: "village_name" },
          { label: "Created At", key: "created_at" },
          { label: "Updated At", key: "updated_at" },
        ]}
        data={villageList.map((v) => ({
          village_id: v.village_id,
          city_name:
            cityList.find((c) => c.city_id === v.city_id)?.city_name || "-",
          village_name: v.village_name,
          created_at: v.created_at,
          updated_at: v.updated_at,
          is_active: v.is_active,
        }))}
        actions={{
          onEdit: (row) => {
            const full = villageList.find(
              (v) => v.village_id === row.village_id,
            );
            setEditData(full);
            setOpenModal(true);
          },
          onDelete: (id) => handleDeleteClick(id),
          onToggle: (id, currentState) =>
            onToggle(id, currentState, "villages", setVillageList),
        }}
        showToggle={true}
        fetchData={fetchData}
        api_name="villages"
      />

      {/* MODAL */}
      <FormModal
        isOpen={openModal}
        onClose={() => {
          setEditData(null);
          setOpenModal(false);
        }}
        title={editData ? "Edit Village" : "Add Village"}
        fields={modalFields}
        initialValues={
          editData || {
            city_id: "",
            village_name: "",
          }
        }
        onSubmit={handleSubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Village"
        message="Are you sure you want to delete this village? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default VillageManagement;
