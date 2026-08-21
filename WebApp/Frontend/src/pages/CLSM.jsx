import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CropStages from "../components/CropStages";
import { useFarms } from "../context/FarmContext";
import AppLoader from "../components/Loaders/AppLoader";
import { mapClcmToStages } from "../utils/mapClcmToStages";

export default function CLSM() {
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedFarm, setSelectedFarm] = useState("");
  const [clcmData, setClcmData] = useState(null);
  const [loadingCLCM, setLoadingCLCM] = useState(false);
  const [error, setError] = useState(null);
  const [farmCrops, setFarmCrops] = useState([]);
  const [sowingDate, setSowingDate] = useState("");

  const [stages, setStages] = useState([]);
  const [clcmLoading, setCLCMLoading] = useState(false);

  const { farms, loading: farmLoading } = useFarms();
  const { user, loading: userLoading } = useAuth();
  const domain = import.meta.env.VITE_DOMAIN;

  console.log({ farmCrops });

  const toInputDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("en-CA");
    // en-CA → YYYY-MM-DD
  };

  const fetchCLCM = async () => {
    try {
      setLoadingCLCM(true);
      setError(null);

      const selectedFarmObj = farms.find(
        (f) => String(f.id) === String(selectedFarm),
      );

      const res = await axios.post(
        `${domain}/CLSM/infer`,
        {
          farm_id: selectedFarm,
          field_id: selectedFarmObj?.field_id,
          crop_name: selectedCrop.toLowerCase(),
          sowing_date: sowingDate,
          current_date: new Date().toISOString().split("T")[0],
          user_id: user.id,
        },
        { withCredentials: true },
      );

      setClcmData(res.data.data);
      console.log(res);

      const finalStages = mapClcmToStages(res.data.data);
      setStages(finalStages);

      const stressResponse = await axios.get(
        `${domain}/stress/${selectedFarmObj?.field_id}/${sowingDate}`,
      );

      console.log({ stressResponse });

      const fastAPIResponse = await axios.post(
        "https://wheat.farmseasy.in/predict-disease",
        {
          crop: res.data.data.crop,
          growth_stage: res.data.data.current_stage,
          vegetation_stress_score:
            stressResponse.data.data.vegetation_stress_score,
          water_stress_score: stressResponse.data.data.water_stress_score,
          soil_stress_score: stressResponse.data.data.soil_stress_score,
          final_stress_percent: stressResponse.data.data.final_stress_percent,
          gdd_min: 300,
          gdd_max: 600,
        },
      );

      console.log({ fastAPIResponse });
    } catch (err) {
      if (
        err.status === 400 &&
        err?.response?.data?.error === "Temperature data unavailable"
      ) {
        setStages([]);
      }
      setError("Failed to fetch crop life cycle data");
      console.error(err);
    } finally {
      setLoadingCLCM(false);
    }
  };

  const fetchFarmCrops = async () => {
    try {
      setCLCMLoading(true);
      if (!selectedFarm) {
        throw new Error("farm_id is required");
      }

      const res = await axios.get(
        `${domain}/farms/get-farm-crops/${selectedFarm}`,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setFarmCrops(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCLCMLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedFarm) return;

    fetchFarmCrops();
  }, [selectedFarm]);

  useEffect(() => {
    if (!farmCrops.length || !selectedCrop) {
      setSowingDate("");
      return;
    }

    const cropData = farmCrops.find(
      (c) => c.crop_name.toLowerCase() === selectedCrop.toLowerCase(),
    );

    if (cropData?.sowing_date) {
      setSowingDate(toInputDate(cropData.sowing_date));
    } else {
      setSowingDate("");
    }
  }, [farmCrops, selectedCrop]);

  useEffect(() => {
    if (!selectedFarm || !selectedCrop || !sowingDate || !user?.id) return;

    fetchCLCM();
  }, [selectedFarm, selectedCrop, sowingDate, user?.id]);

  if (clcmLoading) {
    return <AppLoader label="Analyzing crop life-cycle..." />;
  }

  return (
    <>
      <div className="bg-white border border-white/20 shadow-xl rounded-2xl p-4 md:p-6 flex flex-col gap-2 my-6">
        {/* Title */}
        <h1 className="text-lg md:text-2xl font-bold text-gray-700">
          Crop-Life Cycle Management (Alpha Version)
        </h1>

        <p className="text-gray-400 text-xs md:text-sm">
          Track and manage your crop growth from planting to harvest
        </p>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Select Farm */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="farmName"
              className="text-gray-700/80 text-xs font-semibold md:text-sm"
            >
              SELECT FARM
            </label>

            <select
              id="farmName"
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
              className="w-full appearance-none cursor-pointer rounded-lg border border-slate-300 bg-slate-300/20 px-4 py-2 pr-10 text-slate-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
            >
              <option value="" disabled className="text-black">
                -- Select a farm --
              </option>

              {farms.map((farm) => (
                <option key={farm.id} value={farm.id} className="text-black">
                  {farm.farm_name} ({farm.village_name})
                </option>
              ))}
            </select>
          </div>

          {/* Select Crop */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700/80 text-xs font-semibold md:text-sm">
              Select Crop
            </label>

            <select
              value={selectedCrop}
              disabled={!selectedFarm}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full appearance-none cursor-pointer rounded-lg border border-slate-300 bg-slate-300/20 px-4 py-2 pr-10 text-slate-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
            >
              <option value="" disabled className="text-black">
                {selectedFarm ? "-- Select crop --" : "Select farm first"}
              </option>
              {farmCrops.map((crop) => (
                <option
                  key={crop.id}
                  value={crop.crop_name}
                  className="text-black"
                >
                  {crop.crop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sowing Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700/80 text-xs font-semibold md:text-sm">
              Sowing Date
            </label>

            <input
              type="text"
              disabled
              value={sowingDate}
              className=" w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-slate-700 text-sm shadow-sm cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Harvest Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-700/80 text-xs font-semibold md:text-sm">
              Expected Harvest
            </label>

            <input
              type="text"
              disabled
              value="22/12/2026"
              className=" w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-slate-700 text-sm shadow-sm cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Lifecycle Section */}
      {stages.length === 0 ? (
        <div className="p-6 text-white/70 text-center text-sm">
          No lifecycle data available
        </div>
      ) : (
        <CropStages stages={stages} />
      )}
    </>
  );
}
