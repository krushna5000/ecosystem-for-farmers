import React, { useEffect, useState } from "react";

import AddButton from "./LocationComponents/AddButton";
import FormModal from "./LocationComponents/FormModal";
import DataTable from "./LocationComponents/DataTable";
import ConfirmationPopup from "../ConfirmationPopup";
import toast from "react-hot-toast";

import { getAllStates } from "../../api/location/state.service";
import {
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../api/location/district.service";
import { onToggle } from "../../api/location/onToggle";

const DistrictManagement = () => {
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState(null);

  // -------------------------
  // Load States (Dropdown)
  // -------------------------
  const loadStates = async () => {
    try {
      const data = await getAllStates();
      setStateList(data || []);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Load Districts (Table)
  // -------------------------
  const loadDistricts = async () => {
    try {
      const data = await getAllDistricts();
      const formatted = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString("en-GB"),
        updated_at: new Date(item.updated_at).toLocaleDateString("en-GB"),
      }));
      setDistrictList(formatted);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchData = () => {
    loadStates();
    loadDistricts();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------
  // Add or Update District
  // -------------------------
  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        const response = await updateDistrict(editData.district_id, {
          state_id: formData.state_id,
          district_name: formData.district_name,
        });
        if (response.success) {
          toast.success("District updated!");
          loadDistricts();
        }
      } else {
        const response = await createDistrict({
          state_id: formData.state_id,
          district_name: formData.district_name,
        });
        if (response.success) {
          toast.success("District created!");
          loadDistricts();
        }
      }

      loadDistricts();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Delete District
  // -------------------------
  const handleDeleteClick = (district) => {
    setDistrictToDelete(district);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteDistrict(districtToDelete);

      if (response.success) {
        toast.success("District deleted!");
        loadDistricts();
        setShowConfirm(false);
      }
      loadDistricts();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Modal Fields (Snake Case)
  // -------------------------
  const modalFields = [
    {
      name: "state_id",
      label: "Select State",
      type: "select",
      options: stateList.map((s) => ({
        id: s.state_id,
        name: s.state_name,
      })),
    },
    {
      name: "district_name",
      label: "District Name",
      type: "text",
      onlyAlphabets: true,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">District Management</h1>
          <p className="text-gray-600 mb-6">
            Manage or create all District entries
          </p>
        </div>

        <AddButton
          label="Add District"
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={[
          { label: "ID", key: "district_id" },
          { label: "State Name", key: "state_name" },
          { label: "District Name", key: "district_name" },
          { label: "Created At", key: "created_at" },
          { label: "Updated At", key: "updated_at" },
        ]}
        data={districtList.map((d) => ({
          district_id: d.district_id,
          state_name:
            stateList.find((s) => s.state_id === d.state_id)?.state_name || "-",
          district_name: d.district_name,
          created_at: d.created_at,
          updated_at: d.updated_at,
          is_active: d.is_active,
        }))}
        actions={{
          onEdit: (row) => {
            const full = districtList.find(
              (dist) => dist.district_id === row.district_id,
            );
            setEditData(full);
            setOpenModal(true);
          },
          onDelete: (id) => handleDeleteClick(id),
          onToggle: (id, currentState) =>
            onToggle(id, currentState, "districts", setDistrictList),
        }}
        showToggle={true}
        fetchData={fetchData}
        api_name="districts"
      />

      {/* MODAL */}
      <FormModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditData(null);
        }}
        title={editData ? "Edit District" : "Add District"}
        fields={modalFields}
        initialValues={
          editData || {
            state_id: "",
            district_name: "",
          }
        }
        onSubmit={handleSubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete District"
        message="Are you sure you want to delete this district? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default DistrictManagement;
