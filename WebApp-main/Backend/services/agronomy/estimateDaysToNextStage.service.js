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
