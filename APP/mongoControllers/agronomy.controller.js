import Crop from "../mongoModels/Crop.model.js";
import Disease from "../mongoModels/Disease.model.js";
import farmCropLifecycle from "../mongoModels/farmCropLifecycleSchema.js";
import Weather from "../mongoModels/Weather.model.js";

import {
  calculateCumulativeGDD,
  calculateDAS,
  extractDailyTemperatures,
  estimateDaysToNextStage,
  evaluateDiseaseRisk,
} from "../services/agronomy/index.js";

import {
  determineStageWithTransition, // 🆕
} from "../services/agronomy/stageTransition.service.js";

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const agronomyInference = async (req, res) => {
  try {
    const { user_id, farm_id, field_id, crop_name, sowing_date, current_date } =
      req.body;

    // Validation
    if (!user_id || !farm_id || !crop_name || !sowing_date || !current_date) {
      return res.status(400).json({ error: "Missing required inputs" });
    }

    // Crop Master
    const crop = await Crop.findOne({ crop: crop_name });
    if (!crop) return res.status(404).json({ error: "Crop not found" });

    // const existingCLCM = await farmCropLifecycle.findOne({
    //   field_id,
    // });

    // if (
    //   existingCLCM?.clcm_status?.last_updated_at &&
    //   isSameDay(
    //     new Date(existingCLCM.clcm_status.last_updated_at),
    //     new Date(current_date),
    //   )
    // ) {
    //   return res.status(200).json({
    //     success: true,
    //     cached: true,
    //     data: existingCLCM,
    //   });
    // }

    // Stage Disease data
    const diseaseData = await Disease.findOne({ crop: crop_name });

    // Weather Data
    const weatherDocs = await Weather.find({
      user_id,
      created_at: { $gte: sowing_date, $lte: current_date },
    }).sort({ created_at: 1 });

    const dailyTemps = extractDailyTemperatures(weatherDocs, farm_id);

    if (dailyTemps.length === 0) {
      return res.status(400).json({ error: "Temperature data unavailable" });
    }

    // -- Agronomy Calculations --

    // Day After Sowing
    const DAS = calculateDAS(sowing_date, current_date);

    // Have to store DAS

    // Cumulative GDD
    const cumulative_gdd = calculateCumulativeGDD(
      dailyTemps,
      crop.base_temperature_c,
    );

    // have to store GDD

    // Transition-aware stage detection
    const stageResult = determineStageWithTransition(
      crop.growth_stages,
      DAS,
      cumulative_gdd,
    );

    const currentStage = stageResult?.dominantStage || null;
    const nextStage = stageResult?.nextStage || null;
    const stage_confidence = stageResult?.confidence || 0.6;

    const expected_days_to_next_stage = currentStage
      ? estimateDaysToNextStage(
          dailyTemps,
          crop.base_temperature_c,
          cumulative_gdd,
          nextStage,
        )
      : "N/A";

    const { disease_risk, probable_disease_types } = evaluateDiseaseRisk(
      diseaseData,
      currentStage,
      DAS,
      cumulative_gdd,
    );

    // Build Lifecycle Stages
    const hasValidCurrentStage = Boolean(currentStage?.stage);

    let reachedCurrentStage = false;

    const mappedStages = crop.growth_stages.map((s) => {
      // Case 1: No current stage yet → nothing completed
      if (!hasValidCurrentStage) {
        console.log(s);
        return {
          stage: s.stage,
          is_completed: false,
          completed_at: null,
        };
      }

      // Case 2: Current stage
      if (s.stage === currentStage.stage) {
        reachedCurrentStage = true;
        return {
          stage: s.stage,
          is_completed: false,
          completed_at: null,
        };
      }

      // Case 3: Stages before current
      if (!reachedCurrentStage) {
        return {
          stage: s.stage,
          is_completed: true,
          completed_at: new Date(),
        };
      }

      // Case 4: Upcoming stages
      return {
        stage: s.stage,
        is_completed: false,
        completed_at: null,
      };
    });

    // Final Object
    const clcmObject = {
      field_id: field_id,
      farm_id: farm_id,
      crop_id: crop._id,
      crop: crop.crop,

      stages: mappedStages,

      current_stage: currentStage?.stage || "Undetermined",
      upcoming_stage: nextStage?.stage || null,

      clcm_status: {
        crop: crop.crop,
        das: DAS,
        cumulative_gdd: cumulative_gdd,
        current_stage: currentStage?.stage || "Undetermined",
        stage_confidence: stage_confidence,
        next_stage: nextStage?.stage || "N/A",
        expected_days_to_next_stage: expected_days_to_next_stage,

        disease_risk: disease_risk,
        probable_disease_types: probable_disease_types,

        summary:
          disease_risk === "HIGH"
            ? "Current crop stage shows higher disease risk. Regular field monitoring is advised."
            : disease_risk === "MODERATE"
              ? "Some disease risk indicators are present. Observe crop condition closely."
              : "Crop growth is progressing normally with low disease risk.",

        // Transition metadata
        transition: stageResult?.transition || null,
        last_updated_at: new Date(),
      },
    };

    // Store or Update MongoDB
    const storedCLCM = await farmCropLifecycle.findOneAndUpdate(
      { farm_id, crop_id: crop._id },
      { $set: clcmObject },
      { upsert: true, new: true },
    );

    // Response
    return res.status(200).json({
      success: true,
      data: storedCLCM,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agronomy inference failed" });
  }
};
