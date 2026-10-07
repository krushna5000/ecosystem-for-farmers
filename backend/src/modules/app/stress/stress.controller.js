import FieldIndex from "../indexes/fieldIndex.mongoModel.js";
import StressResult from "./stressResult.mongoModel.js";
import { invert, mean, clip } from "../../../utils/app/stressUtils.js";
 import mongoose from "mongoose";

export const calculateStress = async (req, res) => {
  const { fieldId, date } = req.params;
  // Protect against NoSQL injection: validate fieldId
 
  if (!mongoose.Types.ObjectId.isValid(fieldId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fieldId format",
    });
  }

  try {
    // ✅ 1. FETCH RECORD FIRST
    const record = await FieldIndex.findOne({ fieldId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Index data not found for given date",
      });
    }

    const today = new Date().toISOString().split("T")[0].replaceAll("-", "");
    const sowingKey = date.replaceAll("-", "");

    // 2️⃣ Helper: pick mean value in range
    const pickRangeMean = (series) => {
      if (!series || typeof series !== "object") return null;

      const valuesInRange = Object.entries(series)
        .filter(([d]) => d >= sowingKey && d <= today)
        .map(([_, v]) => Number(v))
        .filter((v) => !Number.isNaN(v));

      if (valuesInRange.length === 0) return null;

      return mean(valuesInRange);
    };

    // 3️⃣ Build flat snapshot from time-series
    const i = {
      NDVI: pickRangeMean(record.indices.NDVI),
      NDRE: pickRangeMean(record.indices.NDRE),
      EVI: pickRangeMean(record.indices.EVI),
      SAVI: pickRangeMean(record.indices.SAVI),

      NDMI: pickRangeMean(record.indices.NDMI),
      NDWI: pickRangeMean(record.indices.NDWI),
      RSM: pickRangeMean(record.indices.RSM),

      SOC: pickRangeMean(record.indices.SOC),
      BSI: pickRangeMean(record.indices.BSI),
      SI: pickRangeMean(record.indices.SI),
    };

    // ✅ 2. VALIDATE REQUIRED INDEXES
    const requiredIndexes = [
      "NDVI",
      "NDRE",
      "EVI",
      "SAVI",
      "NDMI",
      "NDWI",
      "RSM",
      "SOC",
      "BSI",
      "SI",
    ];

    const missing = requiredIndexes.filter(
      (key) => record.indices[key] === undefined,
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required indexes",
        missing,
      });
    }

    // 🌿 Vegetation Stress
    const vegetationRaw = clip(
      mean([invert(i.NDVI), invert(i.NDRE), invert(i.EVI), invert(i.SAVI)]),
    );

    // 💧 Water Stress
    const waterRaw = clip(mean([invert(i.NDMI), invert(i.NDWI), i.RSM]));

    // 🌱 Soil Stress
    const soilRaw = clip(mean([invert(i.SOC), i.BSI, i.SI]));

    const vegetation_stress_score = vegetationRaw / 100;
    const water_stress_score = waterRaw / 100;
    const soil_stress_score = soilRaw / 100;

    const final_stress_percent = Math.round(
      mean([vegetationRaw, waterRaw, soilRaw]),
    );

    const saved = await StressResult.create({
      fieldId,
      date,
      vegetation_stress_score,
      water_stress_score,
      soil_stress_score,
      final_stress_percent,
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Stress API error:", error);

    return res.status(500).json({
      success: false,
      message: "Stress calculation failed",
      error: error.message,
    });
  }
};
