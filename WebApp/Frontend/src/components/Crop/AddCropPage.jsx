import axios from "axios";
import { ArrowLeft } from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AddCropPage = forwardRef(
  ({ onAddCrop, editingCrop, clearEditing }, ref) => {
    const navigate = useNavigate();
    const domain = import.meta.env.VITE_DOMAIN;
    const { user, loading } = useAuth();

    const [selectedCropID, setSelectedCropID] = useState("");
    const [selectedFarmID, setSelectedFarmID] = useState("");
    const [date, setDate] = useState("");
    const [crops, setCrops] = useState([]);
    const [farms, setFarms] = useState([]);

    const toInputDate = (isoDate) => {
      if (!isoDate) return "";
      return new Date(isoDate).toLocaleDateString("en-CA");
    };

    useEffect(() => {
      if (!editingCrop) return;

      setSelectedFarmID(editingCrop.farm_id);
      setSelectedCropID(editingCrop.crop_id);
      setDate(toInputDate(editingCrop.sowing_date));
    }, [editingCrop]);

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

    const fetchCrops = async () => {
      try {
        const res = await axios.get(`${domain}/farms/get-all-crops`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setCrops(res.data.data);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load crops");
      }
    };

    useEffect(() => {
      fetchCrops();
    }, []);

    const handleCancel = () => {
      setSelectedCropID("");
      setSelectedFarmID("");
      setDate("");
      clearEditing?.();
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!selectedFarmID || !selectedCropID || !date) {
        toast.error("Please select a crop and sowing date!");
        return;
      }

      let response;
      const isEdit = Boolean(editingCrop);
      try {
        if (isEdit) {
          response = await axios.put(
            `${domain}/farms/update-farm-crop/${editingCrop.farm_crop_id}`,
            {
              sowing_date: date,
            },
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            `${domain}/farms/add-farm-crop`,
            {
              farm_id: selectedFarmID,
              crop_id: selectedCropID,
              sowing_date: date,
            },
            {
              withCredentials: true,
              headers: {
                Accept: "application/json",
              },
            }
          );
        }
        if (response.data.success) {
          toast.success(response?.data?.message);
          handleCancel();
          onAddCrop?.();
        }
      } catch (error) {
        console.log(error);
      }
    };

    return (
      <div ref={ref} className="md:p-6 px-2 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app/dashboard")}
            className="p-2 rounded-full border cursor-pointer border-gray-200 bg-white hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>

          <h2 className="text-xl font-semibold text-gray-800">Crop</h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingCrop ? "Edit Crop Details" : "Crop Details"}
          </h3>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select Farm */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Farm
                </label>
                <select
                  value={selectedFarmID}
                  onChange={(e) => setSelectedFarmID(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg border border-gray-300 cursor-pointer text-gray-800 focus:ring-2 focus:ring-green-200 focus:outline-none"
                >
                  <option value="" disabled>
                    -- Choose a Farm --
                  </option>

                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farm_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Crop */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Crop
                </label>
                <select
                  value={selectedCropID}
                  onChange={(e) => setSelectedCropID(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg border border-gray-300 cursor-pointer text-gray-800 focus:ring-2 focus:ring-green-200 focus:outline-none"
                >
                  <option value="" disabled>
                    -- Choose a Crop --
                  </option>

                  {crops.map((crop) => (
                    <option key={crop.crop_id} value={crop.crop_id}>
                      {crop.crop_name} ({crop.category_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sowing Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg border border-gray-300 
              text-gray-800 focus:ring-2 focus:ring-green-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Action */}
              <button
                type="submit"
                className="py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-green-500 hover:bg-green-600 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c1515] transition"
              >
                {editingCrop ? "Update Crop" : "Save Crop"}
              </button>

              {/* Secondary Action */}
              <button
                type="button"
                onClick={handleCancel}
                className="py-2.5 rounded-lg text-sm cursor-pointer font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

export default AddCropPage;
