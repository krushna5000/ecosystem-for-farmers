import React, { useEffect, useState } from "react";

import AddButton from "./LocationComponents/AddButton";
import FormModal from "./LocationComponents/FormModal";
import DataTable from "./LocationComponents/DataTable";
import ConfirmationPopup from "../ConfirmationPopup";
import toast from "react-hot-toast";
import { onToggle } from "../../api/location/onToggle";
import {
  getAllStates,
  createState,
  updateState,
  deleteState,
} from "../../api/location/state.service";

const StateManagement = () => {
  const [states, setStates] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stateToDelete, setStateToDelete] = useState(null);

  // -----------------------------
  // Load States from Backend
  // -----------------------------
  const loadStates = async () => {
    try {
      const data = await getAllStates();
      const formatted = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString("en-GB"),
        updated_at: new Date(item.updated_at).toLocaleDateString("en-GB"),
      }));

      setStates(formatted);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  // -----------------------------
  // Add / Update State
  // -----------------------------
  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        const response = await updateState(editData.state_id, {
          state_name: formData.state_name,
        });
        if (response.success) {
          toast.success("State updated!");
          loadStates();
        }
      } else {
        const response = await createState({
          state_name: formData.state_name,
        });
        if (response.success) {
          toast.success("State created!");
          loadStates();
        }
      }

      loadStates();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Delete State
  const handleDeleteClick = (state) => {
    setStateToDelete(state);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteState(stateToDelete);
      if (response.data.success) {
        toast.success("State deleted!");
        loadStates();
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // -----------------------------
  // Modal Fields (snake_case)
  // -----------------------------
  const modalFields = [
    {
      name: "state_name",
      label: "State Name",
      type: "text",
      onlyAlphabets: true,
    },
  ];

  return (
    <div>
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">State Management</h1>
          <p className="text-gray-600 mb-6">
            Manage or create all State entries
          </p>
        </div>

        <AddButton
          label="Add State"
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={[
          { label: "ID", key: "state_id" },
          { label: "State Name", key: "state_name" },
          { label: "Created At", key: "created_at" },
          { label: "Updated At", key: "updated_at" },
        ]}
        data={states.map((s) => ({
          state_id: s.state_id,
          state_name: s.state_name,
          created_at: s.created_at,
          updated_at: s.updated_at,
        }))}
        actions={{
          onEdit: (row) => {
            const full = states.find((st) => st.state_id === row.state_id);
            setEditData(full);
            setOpenModal(true);
          },
          onDelete: (id) => handleDeleteClick(id),
          onToggle: (id, currentState) =>
            onToggle(id, currentState, "/api/states", setStates),
        }}
        showToggle={false}
        fetchData={loadStates}
        api_name="states"
      />

      {/* MODAL */}
      <FormModal
        isOpen={openModal}
        onClose={() => {
          setEditData(null);
          setOpenModal(false);
        }}
        title={editData ? "Edit State" : "Add State"}
        fields={modalFields}
        initialValues={
          editData || {
            state_name: "",
          }
        }
        onSubmit={handleSubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete State"
        message="Are you sure you want to delete this state? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default StateManagement;
