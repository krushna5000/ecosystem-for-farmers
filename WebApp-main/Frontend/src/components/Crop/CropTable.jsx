import { Pencil, Trash2 } from "lucide-react";
import React from "react";

export default function CropTable({ crops, onEditCrop, onDeleteCrop }) {
  const formatDateDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";

    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, "0");
    console.log(day);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className="m-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Crops</h3>

      {crops.length === 0 ? (
        <p className="text-gray-500 text-sm">No crops added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-gray-400">
            <thead>
              <tr className="bg-gray-400/20 border-b border-gray-400 text-gray-600">
                <th className="p-3 font-medium">Farm Name</th>
                <th className="p-3 font-medium">Crop Name</th>
                <th className="p-3 font-medium">Sowing Date</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {crops.map((crop, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-gray-800">{crop.farm_name}</td>
                  <td className="p-3 text-gray-800">{crop.crop_name}</td>
                  <td className="p-3 text-gray-600">
                    {formatDateDDMMYYYY(crop.sowing_date)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Edit */}
                      <button
                        onClick={() => onEditCrop(crop)}
                        className="p-2 rounded-md cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        title="Edit Crop"
                      >
                        <Pencil className="w-4 h-4 cursor-pointer" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteCrop(crop)}
                        className="p-2 bg-red-50 cursor-pointer rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        title="Delete Crop"
                      >
                        <Trash2 className="w-4 h-4 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
