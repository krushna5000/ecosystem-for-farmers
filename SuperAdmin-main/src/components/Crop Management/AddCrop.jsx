import React, { useEffect, useState } from "react";
import CropTable from "./CropTable";
import toast from "react-hot-toast";
import CreateCrop from "./CreateCrop";
import ConfirmationPopup from "../ConfirmationPopup";
import CropHeader from "./CropHeader";
import { deleteCropApi, getCrops } from "../../api/createCropApi";
import ShowCrop from "./ShowCrop";

export default function AddCrop() {
  const emptyCrop = {
    farm_id: 1,
    category: "",
    name: "",
    t_base: 0,
    crop_stages: [
      {
        stage_id: "",
        stage_name: "",
        das_min: "",
        das_max: "",
        gdd_min: "",
        gdd_max: "",
      },
    ],
  };

  const [crops, setCrops] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cropData, setCropData] = useState(emptyCrop);
  const [deleteCrop, setDeleteCrop] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleViewClick = (crop) => {
    setSelectedCrop(crop);
    setIsViewOpen(true);
  };

  const openCreatePopup = () => {
    setIsEditing(false);
    setCropData(emptyCrop);
    setIsPopupOpen(true);
  };

  const handleEditClick = (crop) => {
    console.log({ crop });

    setIsEditing(true);

    setCropData({
      id: crop.id,
      farm_id: crop.farm_id,
      category: crop.category_id,
      name: crop.crop_name,
      t_base: crop.t_base,
      crop_stages: crop.crop_stages.map((s) => ({
        stage_id: s.id,
        stage_name: s.stage_name,
        das_min: String(s.das_min),
        das_max: String(s.das_max),
        gdd_min: String(s.gdd_min),
        gdd_max: String(s.gdd_max),
      })),
    });

    setIsPopupOpen(true);
  };

  // delete crop
  const handleDeleteClick = (crop) => {
    setDeleteCrop(crop);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCrop) return;
    console.log(deleteCrop);

    try {
      const res = await deleteCropApi(deleteCrop.id);

      if (res.data.success) {
        setCrops((prev) => prev.filter((c) => c.id !== deleteCrop.id));
        toast.success("Crop deleted!");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsConfirmOpen(false);
      setDeleteCrop(null);
    }
  };

  //  Fetching all crops
  const fetchCrops = async () => {
    try {
      const res = await getCrops();
      if (res.data.success) {
        setCrops(res.data.data || []);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setIsEditing(false);
    setCropData(emptyCrop);
    fetchCrops();
  };

  return (
    <>
      <CropHeader
        type="crop"
        onCreateClick={() => setIsPopupOpen(!isPopupOpen)}
      />
      <CropTable
        crops={crops}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onCreateClick={openCreatePopup}
        onViewClick={handleViewClick}
        fetchCrops={fetchCrops}
      />
      {isPopupOpen && (
        <CreateCrop
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          cropData={cropData}
          setCropData={setCropData}
          isEditing={isEditing}
        />
      )}
      <ConfirmationPopup
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Crop"
        message={`Are you sure you want to delete ${deleteCrop?.crop_name}?`}
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

      {isViewOpen && (
        <ShowCrop crop={selectedCrop} onClose={() => setIsViewOpen(false)} />
      )}
    </>
  );
}
