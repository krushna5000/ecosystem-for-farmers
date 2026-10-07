import { React } from "react";
import { useNavigate } from "react-router-dom";
import { Locate, MapPin, Plus } from "lucide-react";
import { useFarms } from "../../context/FarmContext";

export default function ActiveFarms({ farms }) {
  const navigate = useNavigate();

  const FARM_IMAGES = {
    wheat: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    rice: "https://images.unsplash.com/photo-1729041221905-0519efecaa92",
    jowar: "https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9",
    default: "https://images.unsplash.com/photo-1559668772-786155c8cdf2",
  };

  const getFarmImage = (name = "") => {
    const key = name.toLowerCase();
    return FARM_IMAGES[key] || FARM_IMAGES.default;
  };

  const mappedFarms = farms.map((farm) => ({
    id: farm.id,
    name: farm.farm_name,
    location: `${farm.village_name}, ${farm.district_name}`,
    img: getFarmImage(farm.farm_name),
    stage: "Not Started", // placeholder (backend later)
    sowingDate: farm.created_at?.split("T")[0],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Active Farms</h2>
        <div className="flex gap-2 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <button
            onClick={() => navigate("/app/add-farm")}
            className="flex items-center gap-2 text-sm font-medium cursor-pointer px-3 py-2 rounded-md border border-gray-200 transition bg-[#1cf56c] hover:bg-[#00dc51d4] text-black"
          >
            <Plus size={16} />
            Add Farm
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mappedFarms.map((farm) => (
          <div
            key={farm.id}
            className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            {/* Image Section */}
            <div className="relative h-44">
              <img
                src={farm.img}
                alt={farm.name}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Text on Image */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-lg font-semibold leading-tight">
                  {farm.name}
                </h3>

                <p className="text-sm text-white/90 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {farm.location}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">
                Created: {farm.sowingDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
