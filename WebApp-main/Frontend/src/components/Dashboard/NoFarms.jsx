import { Plus, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NoFarms() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
      <MapPin className="w-12 h-12 text-gray-400" />

      <h2 className="text-lg font-semibold text-gray-800">
        No Farms Added Yet
      </h2>

      <p className="text-sm text-gray-500 max-w-sm">
        You haven’t added any farms yet. Start by adding your first farm to
        track and manage it here.
      </p>

      <button
        onClick={() => navigate("/app/add-farm")}
        className="flex items-center cursor-pointer gap-2 mt-2 px-4 py-2 rounded-md bg-[#1cf56c] hover:bg-[#00dc51d4] text-black font-medium transition"
      >
        <Plus size={16} />
        Add Your First Farm
      </button>
    </div>
  );
}
