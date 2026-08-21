function findStageWindow(stages, cumulative_gdd) {
  for (let i = 0; i < stages.length - 1; i++) {
    if (
      cumulative_gdd >= stages[i].gdd_min &&
      cumulative_gdd < stages[i + 1].gdd_min
    ) {
      return { current: stages[i], next: stages[i + 1] };
    }
  }

  if (cumulative_gdd < stages[0].gdd_min) {
    return { current: stages[0], next: stages[1] };
  }

  return {
    current: stages[stages.length - 1],
    next: null,
  };
}

function calculateTransitionProgress(current, next, cumulative_gdd) {
  if (!next) return 1;

  const currentMid = (current.gdd_min + current.gdd_max) / 2;
  const nextMid = (next.gdd_min + next.gdd_max) / 2;

  const progress = (cumulative_gdd - currentMid) / (nextMid - currentMid);

  return Math.min(1, Math.max(0, Number(progress.toFixed(2))));
}

function dasConsistency(stage, DAS) {
  if (DAS < stage.das_min - 7 || DAS > stage.das_max + 7) {
    return 0.75;
  }
  return 1;
}

export function determineStageWithTransition(stages, DAS, cumulative_gdd) {
  const window = findStageWindow(stages, cumulative_gdd);
  if (!window) return null;

  const { current, next } = window;

  const progress = calculateTransitionProgress(current, next, cumulative_gdd);

  const dominantStage = progress < 0.6 || !next ? current : next;

  const confidence =
    0.6 +
    0.4 *
      (1 - Math.abs(progress - 0.5) * 2) *
      dasConsistency(dominantStage, DAS);

  return {
    dominantStage,
    nextStage: next,
    transition: {
      from: current.stage,
      to: next?.stage || null,
      progress,
      phase: progress < 0.3 ? "early" : progress < 0.7 ? "mid" : "late",
    },
    confidence: Number(confidence.toFixed(2)),
  };
}
