import { Pencil, Trash2 } from "lucide-react";
import React from "react";

export default function FarmTable({ farms, onEditFarm, onDeleteFarm }) {
  return (
    <div className="m-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Farms</h3>

      {farms.length === 0 ? (
        <p className="text-gray-500 text-sm">No farms added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border border-gray-400">
            <thead>
              <tr className="bg-gray-400/20 border-b border-gray-400 text-gray-600">
                <th className="p-3 font-medium">Farm</th>
                <th className="p-3 font-medium">Pincode</th>
                <th className="p-3 font-medium">Latitude</th>
                <th className="p-3 font-medium">Longitude</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {farms.map((farm, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-gray-800">{farm.farm_name}</td>
                  <td className="p-3 text-gray-800">{farm.pincode}</td>
                  <td className="p-3 text-gray-800">{farm.latitude}</td>
                  <td className="p-3 text-gray-800">{farm.longitude}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Edit Button */}
                      <button className="p-2 rounded-md cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                        <Pencil
                          onClick={() => onEditFarm(farm)}
                          className="w-4 h-4"
                        />
                      </button>

                      {/* Delete Button */}
                      <button className="p-2 bg-red-50 rounded-md cursor-pointer text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors">
                        <Trash2
                          onClick={() => onDeleteFarm(farm)}
                          className="w-4 h-4"
                        />
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
