import React, { useEffect, useState } from "react";

import AddButton from "./LocationComponents/AddButton";
import FormModal from "./LocationComponents/FormModal";
import DataTable from "./LocationComponents/DataTable";
import toast from "react-hot-toast";
import ConfirmationPopup from "../ConfirmationPopup";

import { getAllDistricts } from "../../api/location/district.service";
import {
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
} from "../../api/location/city.service";
import { onToggle } from "../../api/location/onToggle";

const CityManagement = () => {
  const [districtList, setDistrictList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  // -------------------------
  // Load Districts (Dropdown)
  // -------------------------
  const loadDistricts = async () => {
    try {
      const data = await getAllDistricts();
      setDistrictList(data || []);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Load Cities (Table)
  // -------------------------
  const loadCities = async () => {
    try {
      const data = await getAllCities();
      const formatted = data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString("en-GB"),
        updated_at: new Date(item.updated_at).toLocaleDateString("en-GB"),
      }));
      setCityList(formatted);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchData = () => {
    loadDistricts();
    loadCities();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------
  // Add or Update City
  // -------------------------
  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        const response = await updateCity(editData.city_id, {
          district_id: formData.district_id,
          city_name: formData.city_name,
        });
        if (response.success) {
          toast.success("City updated!");
          loadCities();
          setShowConfirm(false);
        }
      } else {
        const response = await createCity({
          district_id: Number(formData.district_id),
          city_name: formData.city_name,
        });
        if (response.success) {
          toast.success("City created!");
          loadCities();
          setShowConfirm(false);
        }
      }

      loadCities();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Delete City
  // -------------------------
  const handleDeleteClick = (city) => {
    setCityToDelete(city);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteCity(cityToDelete);
      if (response.success) {
        toast.success("City deleted!");
        loadCities();
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // -------------------------
  // Modal Fields (Snake Case)
  // -------------------------
  const modalFields = [
    {
      name: "district_id",
      label: "Select District",
      type: "select",
      options: districtList
        .filter((d) => d.is_active)
        .map((d) => ({
          id: d.district_id,
          name: d.district_name,
        })),
    },
    {
      name: "city_name",
      label: "City Name",
      type: "text",
      onlyAlphabets: true,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">City Management</h1>
          <p className="text-gray-600 mb-6">
            Manage or create all City entries
          </p>
        </div>

        <AddButton
          label="Add City"
          onClick={() => {
            setEditData(null);
            setOpenModal(true);
          }}
        />
      </div>

      {/* TABLE */}
      <DataTable
        columns={[
          { label: "ID", key: "city_id" },
          { label: "District Name", key: "district_name" },
          { label: "City Name", key: "city_name" },
          { label: "Created At", key: "created_at" },
          { label: "Updated At", key: "updated_at" },
        ]}
        data={cityList.map((c) => ({
          city_id: c.city_id,
          district_name:
            districtList.find((d) => d.district_id === c.district_id)
              ?.district_name || "-",
          city_name: c.city_name,
          created_at: c.created_at,
          updated_at: c.updated_at,
          is_active: c.is_active,
        }))}
        actions={{
          onEdit: (row) => {
            const full = cityList.find((city) => city.city_id === row.city_id);
            setEditData(full);
            setOpenModal(true);
          },
          onDelete: (id) => handleDeleteClick(id),
          onToggle: (id, currentState) =>
            onToggle(id, currentState, "cities", setCityList),
        }}
        showToggle={true}
        fetchData={fetchData}
        api_name="cities"
      />

      {/* MODAL */}
      <FormModal
        isOpen={openModal}
        onClose={() => {
          setEditData(null);
          setOpenModal(false);
        }}
        title={editData ? "Edit City" : "Add City"}
        fields={modalFields}
        initialValues={
          editData || {
            district_id: "",
            city_name: "",
          }
        }
        onSubmit={handleSubmit}
      />
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete City"
        message="Are you sure you want to delete this city? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-500 hover:bg-red-600"
      />
    </div>
  );
};

export default CityManagement;
