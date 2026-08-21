export function mapClcmToStages({
  stages = [],
  current_stage,
  upcoming_stage,
  clcm_status,
}) {
  return stages.map((s, index) => {
    let status = "upcoming";
    let progress = 0;

    if (s.is_completed) {
      status = "completed";
      progress = 100;
    } else if (s.stage === current_stage) {
      status = "current";
      progress = Math.round((clcm_status?.stage_confidence || 0) * 100);
    }

    const isCurrent = status === "current";

    return {
      id: index + 1,
      stage: s.stage,
      status,
      is_completed: s.is_completed,

      description: isCurrent
        ? clcm_status?.summary
        : status === "completed"
        ? "Stage completed successfully"
        : "Upcoming growth stage",

      duration:
        isCurrent && s.stage === upcoming_stage
          ? clcm_status?.expected_days_to_next_stage || "N/A"
          : "N/A",

      startDate: s.completed_at
        ? new Date(s.completed_at).toLocaleDateString()
        : null,

      endDate:
        status === "completed" && s.completed_at
          ? new Date(s.completed_at).toLocaleDateString()
          : null,

      progress,

      // 🌾 Disease Risk (ONLY for current stage)
      diseaseRisk: isCurrent
        ? {
            overall: clcm_status?.disease_risk || "LOW",
            diseases: clcm_status?.probable_disease_types || [],
          }
        : null,

      transition: clcm_status.transition,
      // 🌱 Future-ready placeholders
      tips: [],
      waterNeeds: "N/A",
      fertilizerNeeds: "N/A",
      commonIssues: [],
    };
  });
}
