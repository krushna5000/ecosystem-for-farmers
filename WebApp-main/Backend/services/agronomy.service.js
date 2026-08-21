export function calculateDAS(sowing_date, current_date) {
  return Math.floor(
    (new Date(current_date) - new Date(sowing_date)) / (1000 * 60 * 60 * 24)
  );
}

export function extractDailyTemperatures(weatherDocs) {
  const temps = [];

  weatherDocs.forEach((doc) => {
    const farm = doc.farmsWithWeather?.[0];
    const daily = farm?.weather?.daily?.[0];

    if (daily?.temp?.day !== undefined) {
      const tempCelsius = Number((daily.temp.day - 273.15).toFixed(2));
      console.log(tempCelsius);
      temps.push({
        date: doc.created_at,
        avg_temperature: tempCelsius,
      });
    }
  });

  return temps;
}

export function calculateCumulativeGDD(dailyTemps, baseTemp) {
  let gdd = 0;

  dailyTemps.forEach((t) => {
    gdd += Math.max(0, t.avg_temperature - baseTemp);
  });

  console.log("Final GDD:", gdd);

  return Number(gdd.toFixed(2));
}

export function determineCurrentStage(stages, DAS, cumulative_gdd) {
  // 1️⃣ Primary: DAS + GDD match
  const strictMatches = stages.filter(
    (s) =>
      DAS >= s.das_min &&
      DAS <= s.das_max &&
      cumulative_gdd >= s.gdd_min &&
      cumulative_gdd <= s.gdd_max
  );

  if (strictMatches.length === 1) return strictMatches[0];

  if (strictMatches.length > 1) {
    return strictMatches.reduce((best, s) => {
      const mid = (s.gdd_min + s.gdd_max) / 2;
      const bestMid = (best.gdd_min + best.gdd_max) / 2;
      return Math.abs(mid - cumulative_gdd) < Math.abs(bestMid - cumulative_gdd)
        ? s
        : best;
    });
  }

  // 2️⃣ Fallback: DAS-only match
  const dasOnlyMatches = stages.filter(
    (s) => DAS >= s.das_min && DAS <= s.das_max
  );

  if (dasOnlyMatches.length === 1) return dasOnlyMatches[0];

  if (dasOnlyMatches.length > 1) {
    // choose the stage whose DAS range midpoint is closest
    return dasOnlyMatches.reduce((best, s) => {
      const mid = (s.das_min + s.das_max) / 2;
      const bestMid = (best.das_min + best.das_max) / 2;
      return Math.abs(mid - DAS) < Math.abs(bestMid - DAS) ? s : best;
    });
  }

  // 3️⃣ Nothing matched (edge case)
  return null;
}

export function calculateStageConfidence(stage, cumulative_gdd) {
  if (!stage) return 0.6;

  const mid = (stage.gdd_min + stage.gdd_max) / 2;
  const range = stage.gdd_max - stage.gdd_min || 1;

  return Number(
    Math.min(
      0.9,
      Math.max(0.6, 1 - Math.abs(cumulative_gdd - mid) / range)
    ).toFixed(2)
  );
}

export function determineNextStage(stages, currentStage) {
  const index = stages.findIndex((s) => s.stage === currentStage.stage);
  return stages[index + 1] || null;
}

export function estimateDaysToNextStage(
  dailyTemps,
  baseTemp,
  cumulative_gdd,
  nextStage
) {
  if (!nextStage) return "N/A";

  const avgTemp =
    dailyTemps.reduce((s, t) => s + t.avg_temperature, 0) / dailyTemps.length;

  const avgDailyGDD = avgTemp - baseTemp;

  if (avgDailyGDD <= 0) return "N/A";

  const remainingGDD = nextStage.gdd_min - cumulative_gdd;
  return Math.ceil(remainingGDD / avgDailyGDD) + " days";
}
export function evaluateDiseaseRisk(
  diseaseData,
  currentStage,
  DAS,
  cumulative_gdd
) {
  if (!diseaseData || !currentStage) {
    return {
      disease_risk: "LOW",
      probable_disease_types: [],
    };
  }

  const matches = [];
  let overallRisk = "LOW";

  for (const d of diseaseData.disease_risk) {
    const stageMatch = d.stage === currentStage.stage;
    const dasMatch = DAS >= d.das_min && DAS <= d.das_max;
    const gddMatch = cumulative_gdd >= d.gdd_min && cumulative_gdd <= d.gdd_max;

    if (stageMatch && dasMatch && gddMatch) {
      matches.push({
        disease_name: d.disease_name,
        risk: "HIGH",
      });
      overallRisk = "HIGH";
      continue;
    }

    if (stageMatch && (dasMatch || gddMatch)) {
      matches.push({
        disease_name: d.disease_name,
        risk: "MODERATE",
      });
      if (overallRisk !== "HIGH") {
        overallRisk = "MODERATE";
      }
    }
  }

  return {
    disease_risk: overallRisk,
    probable_disease_types: matches,
  };
}
