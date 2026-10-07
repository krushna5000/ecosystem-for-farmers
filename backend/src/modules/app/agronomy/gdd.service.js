export function calculateCumulativeGDD(dailyTemps, baseTemp) {
  let gdd = 0;

  dailyTemps.forEach((t) => {
    gdd += Math.max(0, t.avg_temperature - baseTemp);
  });

  return Number(gdd.toFixed(2));
}
