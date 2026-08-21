import React from "react";
import { X, MapPin, User, Calendar, Sprout, Clock } from "lucide-react";

export default function ShowCrop({ crop, onClose }) {
  if (!crop) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>

          {/* Crop Name & ID */}
          <div className="flex items-start justify-between pr-10">
            {/* Left Section */}
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-[#cbff2e] rounded-full flex items-center justify-center">
                <Sprout className="text-green-700" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{crop.crop_name}</h2>
                <p className="text-green-100 text-sm">ID: {crop.id}</p>
              </div>
            </div>

            {/* Crop Category*/}
            <div className="inline-flex items-center px-4 py-2 bg-[#cbff2e]/20 border-2 border-[#cbff2e] rounded-full">
              <span className="font-semibold text-gray-800">
                {crop.category_name}
              </span>
            </div>
          </div>
        </div>

        {/* Crop Info */}
        <div className="p-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farm Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Sprout size={18} />
                <span className="font-semibold">Farm Details</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Farm:</strong> {crop.farm_name}
              </p>
              <p className="text-sm text-gray-600">ID: {crop.farm_id}</p>
            </div>

            {/* Created Date */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={18} />
                <span className="font-semibold">Created</span>
              </div>
              <p className="text-sm text-gray-700">
                {new Date(crop.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(crop.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Crop Stages */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Growth Stages
              </h3>
            </div>

            {crop.crop_stages?.length > 0 ? (
              <div className="space-y-3">
                {crop.crop_stages.map((stage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border-l-4 border-[#cbff2e] rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#cbff2e] rounded-full flex items-center justify-center font-bold text-green-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {stage.stage_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{stage.days}</span> days ·{" "}
                        <span className="font-medium">{stage.weeks}</span> weeks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Sprout size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 italic">No growth stages defined</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
