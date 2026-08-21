import axios from "axios";
import React, { useState } from "react";

export default function CropForm() {
  const [cropName, setCropName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [T_Base, setT_Base] = useState("");
  const [showGDD, setShowGDD] = useState(false);
  const [GDD, setGDD] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/transform", {
        cropName: cropName,
        Latitude: latitude,
        Longitude: longitude,
        T_Base: T_Base,
      });

      setGDD(response.data.GDD);
      setShowGDD(true);

      console.log("API Response:", response);
      alert("Data submitted successfully!");
    } catch (err) {
      console.error("API Error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-[400px] max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Crop Details
        </h2>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Crop Name</label>
          <input
            type="text"
            placeholder="Enter Crop Name"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Latitude</label>
          <input
            type="text"
            placeholder="Enter Latitude"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Longitude</label>
          <input
            type="text"
            placeholder="Enter Longitude"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">T_Base</label>
          <input
            type="text"
            placeholder="Enter GDD"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={T_Base}
            onChange={(e) => setT_Base(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Submit
        </button>
      </form>
      {showGDD && (
        <div className="mt-4 bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-700">
            Calculated GDD
          </h3>
          <p className="text-gray-700 font-bold">{GDD}</p>
        </div>
      )}
    </div>
  );
}
