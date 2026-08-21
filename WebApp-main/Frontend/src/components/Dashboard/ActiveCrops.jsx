import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Wheat from "../../assets/wheat.png";
import Maize from "../../assets/maize.png";
import Cotton from "../../assets/cotton.png";

export default function ActiveCrops({ crops }) {
  const navigate = useNavigate();

  const activeCrops = [
    {
      name: "Wheat",
      subCategory: "Grain",
      stage: "Germination",
      sowingDate: "2025-11-01",
      img: `${Wheat}`,
    },
    // {
    //   name: "Maize",
    //   subCategory: "Cereal",
    //   stage: "Tillering",
    //   sowingDate: "2025-10-20",
    //   img: `${Maize}`,
    // },
    // {
    //   name: "Cotton",
    //   subCategory: "Fiber",
    //   stage: "Flowering",
    //   sowingDate: "2025-11-05",
    //   img: `${Cotton}`,
    // },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Active Crops</h2>

        <div className="flex gap-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <button
            onClick={() => navigate("/app/add-crop")}
            className="flex items-center cursor-pointer gap-2 text-sm font-medium px-3 py-2 rounded-md border border-gray-200 bg-[#1cf56c] hover:bg-[#00dc51d4] text-black transition"
          >
            <Plus size={16} />
            Add Crop
          </button>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeCrops.map((crop, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
          >
            <div className="relative h-44">
              {/* Image */}
              <img
                src={crop.img}
                alt={crop.name}
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
              {/* Name & Category */}
              <div>
                <h3 className="text-gray-900 text-lg font-semibold">
                  {crop.name}
                </h3>
                <p className="text-sm text-gray-500">{crop.subCategory}</p>
              </div>

              {/* Stage & Sowing Date */}
              <div className="flex justify-between items-center text-sm">
                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                  {crop.stage}
                </span>
                <span className="text-gray-500">{crop.sowingDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
