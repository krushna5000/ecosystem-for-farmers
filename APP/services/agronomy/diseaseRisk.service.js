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
