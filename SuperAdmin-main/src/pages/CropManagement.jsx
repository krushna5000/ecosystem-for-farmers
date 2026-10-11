// CropManagement.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CreateCrop from "../components/Crop Management/CreateCrop";

export default function CropManagement() {
  const initialCrop = {
    farm_id: 1,
    category: "",
    name: "",
    stages: [{ stageNo: 1, stageName: "" }],
  };

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cropData, setCropData] = useState(initialCrop);

  // When user clicks "Edit Crop" in any listing page
  const handleEditCrop = (crop) => {
    setCropData(crop);
    setIsPopupOpen(true);
  };

  return (
    <>
      <div>
        <CreateCrop
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setCropData(initialCrop);
          }}
          cropData={cropData}
          setCropData={setCropData}
        />
      </div>

      {/* Pass editCrop handler to children pages */}
      <Outlet context={{ handleEditCrop }} />
    </>
  );
}
