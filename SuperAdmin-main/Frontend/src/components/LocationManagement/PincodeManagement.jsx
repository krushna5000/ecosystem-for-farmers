import React, { useEffect, useState } from "react";

import AddButton from "./LocationComponents/AddButton";
import FormModal from "./LocationComponents/FormModal";
import DataTable from "./LocationComponents/DataTable";
import ConfirmationPopup from "../ConfirmationPopup";
import toast from "react-hot-toast";
import { onToggle } from "../../api/location/onToggle";

// Services
import { getAllVillages } from "../../api/location/village.service";
import {
  getAllPincodes,
  createPincode,
  updatePincode,
  deletePincode,
} from "../../api/location/pincode.service";

const PincodeManagement = () => {
  const [villageList, setVillageList] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pincodeToDelete, setPincodeToDelete] = useState(null);

  // -------------------------
  // Load Villages (Dropdown)
  // -------------------------
  const loadVillages = async () => {
    try {
      const data = await getAllVillages();
      setVillageList(data || []);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Load Pincodes
  // -------------------------
  const loadPincodes = async () => {
    try {
      const data = await getAllPincodes();
      const formatted = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString("en-GB"),
        updated_at: new Date(item.updated_at).toLocaleDateString("en-GB"),
      }));
      setPincodeList(formatted);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const fetchData = () => {
    loadVillages();
    loadPincodes();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------
  // ADD / UPDATE
  // -------------------------
  const handleSubmit = async (formData) => {
    const pincode = String(formData.pincode);

    if (pincode.length != 6) {
      toast.error("Pincode should be of 6 digits.");
      return;
    }

    try {
      if (editData) {
        const response = await updatePincode(editData.pincode_id, {
          village_id: formData.village_id,
          pincode: formData.pincode,
        });
        if (response.success) {
          toast.success("Pin Code updated!");
          loadPincodes();
        }
      } else {
        const response = await createPincode({
          village_id: formData.village_id,
          pincode: formData.pincode,
        });
        if (response.success) {
          toast.success("Pin Code added!");
          loadPincodes();
        }
      }

      loadPincodes();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const handleDeleteClick = (pincode) => {
    setPincodeToDelete(pincode);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deletePincode(pincodeToDelete);

      if (response.success) {
        toast.success("Pincode Deleted.");
        loadPincodes();
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Modal Fields
  // -------------------------
  const modalFields = [
    {
      name: "village_id",
      label: "Select Village",
      type: "select",
      options: villageList
        .filter((v) => v.is_active)
        .map((v) => ({
          id: v.village_id,
          name: v.village_name,
        })),
    },
    {
      name: "pincode",
      label: "Pincode",
      type: "text",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Pincode Management</h1>
          <p className="text-gray-600 mb-6">
            Manage or create all Pincode entries
          </p>
        </div>

        <AddButton
          label="Add Pincode"
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={[
          { label: "ID", key: "pincode_id" },
          { label: "Village Name", key: "village_name" },
          { label: "Pincode", key: "pincode" },
          { label: "Created At", key: "created_at" },
          { label: "Updated At", key: "updated_at" },
        ]}
        data={pincodeList.map((p) => ({
          pincode_id: p.pincode_id,
          village_name:
            villageList.find((v) => v.village_id === p.village_id)
              ?.village_name || "-",
          pincode: p.pincode,
          created_at: p.created_at,
          updated_at: p.updated_at,
          is_active: p.is_active,
        }))}
        actions={{
          onEdit: (row) => {
            const full = pincodeList.find(
              (pc) => pc.pincode_id === row.pincode_id,
            );
            setEditData(full);
            setOpenModal(true);
          },
          onDelete: (id) => handleDeleteClick(id),
          onToggle: (id, currentState) =>
            onToggle(id, currentState, "pincodes", setPincodeList),
        }}
        showToggle={true}
        fetchData={fetchData}
        api_name="pincodes"
      />

      {/* MODAL */}
      <FormModal
        isOpen={openModal}
        onClose={() => {
          setEditData(null);
          setOpenModal(false);
        }}
        title={editData ? "Edit Pincode" : "Add Pincode"}
        fields={modalFields}
        initialValues={
          editData || {
            village_id: "",
            pincode: "",
          }
        }
        onSubmit={handleSubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Pincode"
        message="Are you sure you want to delete this pincode? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default PincodeManagement;
