import { X } from "lucide-react";
import toast from "react-hot-toast";
import { getCategories } from "../../api/cropCategoryApi";
import { getStages } from "../../api/cropStageApi";
import { createCrop, updateCrop } from "../../api/createCropApi";
import { useEffect, useState } from "react";

const CreateCrop = ({
  isOpen,
  onClose,
  cropData,
  setCropData,
  isEditing = false,
}) => {
  const [categories, setCategories] = useState([]);
  const [cropStages, setCropStages] = useState([]);

  if (!isOpen) return null;

  // Fetch crop stages
  const fetchCropStages = async () => {
    try {
      const response = await getStages();
      if (response.data.success) {
        const mapped = response.data.data.map((item) => ({
          id: item.id,
          stage_name: item.stage_name,
          description: item.description,
        }));
        setCropStages(mapped);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCropStages();
  }, []);

  // Sync existing crop stages when editing
  useEffect(() => {
    if (isEditing && cropStages.length && cropData.crop_stages?.length) {
      const updated = cropData.crop_stages.map((stage) => {
        const st = cropStages.find(
          (s) => s.id === Number(stage.stage_id || stage.id)
        );
        return {
          ...stage,
          stage_id: st?.id || "",
          stage_name: st?.stage_name || "",
          gdd_min: stage.gdd_min ?? "",
          gdd_max: stage.gdd_max ?? "",
          das_min: stage.das_min ?? "",
          das_max: stage.das_max ?? "",
        };
      });

      setCropData({ ...cropData, crop_stages: updated });
    }
  }, [cropStages]);

  // BASIC FIELD CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "t_base" && !/^\d{0,2}$/.test(value)) return;

    setCropData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // HANDLES ONLY STAGE SELECT
  const handleStageSelect = (index, stageId) => {
    const selected = cropStages.find((s) => s.id === Number(stageId));

    const updatedStages = [...cropData.crop_stages];
    updatedStages[index] = {
      ...updatedStages[index],
      stage_id: selected?.id || "",
      stage_name: selected?.stage_name || "",
    };

    setCropData({ ...cropData, crop_stages: updatedStages });
  };

  const handleStageFieldChange = (index, field, value) => {
    const updatedStages = [...cropData.crop_stages];
    updatedStages[index] = {
      ...updatedStages[index],
      [field]: value,
    };

    setCropData({ ...cropData, crop_stages: updatedStages });
  };

  // ADD NEW STAGE
  const addStage = () => {
    setCropData({
      ...cropData,
      crop_stages: [
        ...cropData.crop_stages,
        {
          stage_id: "",
          stage_name: "",
          das_min: "",
          das_max: "",
          gdd_min: "",
          gdd_max: "",
        },
      ],
    });
  };

  // DELETE STAGE
  const deleteStage = (index) => {
    if (cropData.crop_stages.length === 1) return; // don't remove last
    const updated = cropData.crop_stages.filter((_, i) => i !== index);
    setCropData({ ...cropData, crop_stages: updated });
  };

  // SUBMIT
  const handleSubmit = async () => {
    try {
      const payload = {
        farm_id: cropData.farm_id,
        category_id: Number(cropData.category),
        crop_name: cropData.name,
        t_base: cropData.t_base,
        crop_stages_id: cropData.crop_stages.map((s) => ({
          id: Number(s.stage_id),
          stage_name: s.stage_name,
          das_min: Number(s.das_min),
          das_max: Number(s.das_max),
          gdd_min: Number(s.gdd_min),
          gdd_max: Number(s.gdd_max),
        })),
      };

      let res;
      if (isEditing) {
        res = await updateCrop(cropData.id, payload);
        if (res.data.success) toast.success("Crop Updated Successfully!");
      } else {
        res = await createCrop(payload);
        if (res.data.success) toast.success("Crop Added Successfully!");
      }

      onClose();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const hasIncompleteStage = cropData.crop_stages.some(
    (s) => !s.stage_id || !s.das_min || !s.das_max || !s.gdd_min || !s.gdd_max
  );

  const selectedStageIds = cropData.crop_stages
    .map((s) => Number(s.stage_id))
    .filter(Boolean);

  const isAllStagesSelected =
    selectedStageIds.length >= cropStages.length && cropStages.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 cursor-pointer hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto max-h-[85vh] p-6">
          <h2 className="text-xl font-semibold text-center mb-5">
            {isEditing ? "Update Crop" : "Create New Crop"}
          </h2>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-600">
              Crop Category
            </label>
            <select
              name="category"
              value={cropData.category}
              onChange={handleChange}
              className="w-full border rounded-lg cursor-pointer px-3 py-2 mt-1 mb-2 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full gap-2">
            {/* NAME */}
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Crop Name
              </label>
              <input
                type="text"
                name="name"
                value={cropData.name}
                onChange={handleChange}
                placeholder="Enter Crop Name"
                className="w-full border rounded-lg px-3 py-2 mt-1 mb-2"
                required
              />
            </div>

            {/* T_Base */}
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Base Temperature (°C)
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1 mb-2"
                type="text"
                name="t_base"
                value={cropData.t_base}
                onChange={handleChange}
                placeholder="5"
                inputMode="numeric"
                maxLength={2}
                required
              />
            </div>
          </div>

          {/* STAGES */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">
              Crop Stages
            </label>

            {cropData.crop_stages?.map((stage, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-10 border rounded px-3 py-2">{index + 1}</div>

                <select
                  value={stage.stage_id}
                  onChange={(e) => handleStageSelect(index, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 cursor-pointer bg-white"
                >
                  <option value="">Select Crop Stage</option>

                  {cropStages
                    .filter(
                      (st) =>
                        st.id === Number(stage.stage_id) || // allow selected for this row
                        !selectedStageIds.includes(st.id) // hide duplicates
                    )
                    .map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.stage_name}
                      </option>
                    ))}
                </select>

                <input
                  type="number"
                  value={stage.das_min}
                  placeholder="DAS Min"
                  min="0"
                  onChange={(e) =>
                    handleStageFieldChange(index, "das_min", e.target.value)
                  }
                  className="w-20 border rounded px-2 py-1"
                />

                <input
                  type="number"
                  value={stage.das_max}
                  placeholder="DAS Max"
                  min="0"
                  onChange={(e) =>
                    handleStageFieldChange(index, "das_max", e.target.value)
                  }
                  className="w-20 border rounded px-2 py-1"
                />

                <input
                  type="number"
                  value={stage.gdd_min}
                  placeholder="GDD Min"
                  min="0"
                  onChange={(e) =>
                    handleStageFieldChange(index, "gdd_min", e.target.value)
                  }
                  className="w-24 border rounded px-2 py-1"
                />

                <input
                  type="number"
                  value={stage.gdd_max}
                  placeholder="GDD Max"
                  min="0"
                  onChange={(e) =>
                    handleStageFieldChange(index, "gdd_max", e.target.value)
                  }
                  className="w-24 border rounded px-2 py-1"
                />

                <button
                  type="button"
                  onClick={() => deleteStage(index)}
                  className={`text-red-500 font-bold  ${
                    cropData.crop_stages.length === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex w-full gap-4 mt-6">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={addStage}
                  disabled={isAllStagesSelected}
                  className={`flex-1 w-full py-2 rounded-md font-medium 
                  ${
                    isAllStagesSelected
                      ? "bg-gray-300 cursor-not-allowed text-gray-600"
                      : "bg-[#cbff2e] cursor-pointer text-black"
                  }`}
                >
                  + Add Stage
                </button>
              </div>

              <div className="flex-1">
                {/* SUBMIT */}
                <button
                  onClick={handleSubmit}
                  disabled={hasIncompleteStage}
                  className={`w-full font-semibold py-2 rounded-lg cursor-pointer
              ${
                hasIncompleteStage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#cbff2e] hover:bg-[#baff00]"
              }
            `}
                >
                  {isEditing ? "Update Crop" : "Create Crop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCrop;
