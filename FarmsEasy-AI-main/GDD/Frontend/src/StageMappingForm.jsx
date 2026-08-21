// App.js
import React, { useState, useMemo } from "react";
import { CROP_STAGES, CROP_OPTIONS } from "./CropData";

// Helper function to add days to a date and format it
const addDaysAndFormat = (date, days) => {
  if (!date) return "";
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
};

const StagesMappingForm = () => {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [sowingDate, setSowingDate] = useState("");

  const calculatedStages = useMemo(() => {
    if (!selectedCrop || !sowingDate) return [];

    const stages = CROP_STAGES[selectedCrop];
    if (!stages) return [];

    let currentMinCumulativeDays = 0;
    let currentMaxCumulativeDays = 0;
    const results = [];
    const plantingDate = new Date(sowingDate);

    results.push({
      name: "Sowing/Planting",
      minDuration: 0,
      maxDuration: 0,
      minStart: sowingDate,
      maxStart: sowingDate,
      minEnd: sowingDate,
      maxEnd: sowingDate,
    });

    stages.forEach((stage, index) => {
      let minStartDays, maxStartDays, minEndDays, maxEndDays;

      if (stage.cumulative) {
        minStartDays = stage.cumulative[0];
        maxStartDays = stage.cumulative[0];
        minEndDays = stage.cumulative[0];
        maxEndDays = stage.cumulative[1];

        currentMinCumulativeDays = stage.cumulative[0];
        currentMaxCumulativeDays = stage.cumulative[1];
      } else {
        minStartDays =
          currentMinCumulativeDays +
          (index === 0 ? 0 : stages[index - 1].duration[0]);
        maxStartDays =
          currentMaxCumulativeDays +
          (index === 0 ? 0 : stages[index - 1].duration[1]);

        currentMinCumulativeDays += stage.duration[0];
        currentMaxCumulativeDays += stage.duration[1];

        minEndDays = currentMinCumulativeDays;
        maxEndDays = currentMaxCumulativeDays;
      }

      const minStart = addDaysAndFormat(plantingDate, minStartDays);
      const maxStart = addDaysAndFormat(plantingDate, maxStartDays);
      const minEnd = addDaysAndFormat(plantingDate, minEndDays);
      const maxEnd = addDaysAndFormat(plantingDate, maxEndDays);

      results.push({
        name: stage.name,
        minDuration: stage.cumulative ? stage.cumulative[0] : stage.duration[0],
        maxDuration: stage.cumulative ? stage.cumulative[1] : stage.duration[1],
        minStart,
        maxStart,
        minEnd,
        maxEnd,
      });
    });

    return results.filter((_, index) => index > 0);
  }, [selectedCrop, sowingDate]);

  const handleDateChange = (e) => {
    setSowingDate(e.target.value);
    if (!e.target.value) e.target.focus();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-700">
          🌱 Crop Life Cycle Predictor
        </h1>
        <p className="text-gray-600 mt-2">
          Estimate crop growth stages using your sowing date.
        </p>
      </header>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md mb-8">
        {/* Crop */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Select Crop:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Choose a Crop --</option>
            {CROP_OPTIONS.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Sowing Date:</label>
          <input
            type="date"
            value={sowingDate}
            onChange={handleDateChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Results */}
      {selectedCrop && sowingDate && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">
            Lifecycle Prediction for {selectedCrop}
          </h2>
          <p className="text-gray-700 mb-4">
            Sowing Date:{" "}
            <span className="font-semibold">
              {addDaysAndFormat(new Date(sowingDate), 0)}
            </span>
          </p>

          {/* Table */}
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-3 border">Stage</th>
                <th className="p-3 border">Approx. DAS Range</th>
                <th className="p-3 border">Estimated Start Date</th>
                <th className="p-3 border">Estimated End Date</th>
              </tr>
            </thead>

            <tbody>
              {calculatedStages.map((stage, index) => (
                <tr
                  key={index}
                  className="odd:bg-gray-100 even:bg-white hover:bg-green-50 transition"
                >
                  <td className="p-3 border font-medium">{stage.name}</td>
                  <td className="p-3 border">
                    {stage.cumulative
                      ? `Total: ${stage.minDuration} - ${stage.maxDuration} days`
                      : `${stage.minDuration} - ${stage.maxDuration} days`}
                  </td>
                  <td className="p-3 border">
                    {stage.minStart === stage.maxStart
                      ? stage.minStart
                      : `${stage.minStart} to ${stage.maxStart}`}
                  </td>
                  <td className="p-3 border">
                    {stage.minEnd === stage.maxEnd
                      ? stage.minEnd
                      : `${stage.minEnd} to ${stage.maxEnd}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-gray-600 mt-4 italic">
            *These date ranges are estimates based on typical growth patterns.
            Conditions like temperature, soil quality, rainfall, and crop
            variety may shift the actual timings.*
          </p>
        </div>
      )}

      {/* Image Placeholder */}
      {selectedCrop && (
        <div className="border border-dashed p-4 mt-6 rounded-lg text-center text-gray-500">
          [Image of the growth stages of a {selectedCrop} plant]
        </div>
      )}
    </div>
  );
};

export default StagesMappingForm;
