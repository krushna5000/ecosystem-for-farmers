export function calculateDAS(sowing_date, current_date) {
  return Math.floor(
    (new Date(current_date) - new Date(sowing_date)) / (1000 * 60 * 60 * 24)
  );
}
