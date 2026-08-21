// CropData.js

/**
 * Defines the crop stages and their approximate durations in Days After Sowing (DAS).
 * Duration is represented as an array [min_days, max_days].
 */
export const CROP_STAGES = {
  Wheat: [
    { name: "Germination & Emergence", duration: [7, 14] },
    { name: "Tillering (Branching)", duration: [30, 50] },
    { name: "Stem Elongation (Jointing)", duration: [14, 21] },
    { name: "Heading & Flowering", duration: [17, 24] },
    { name: "Grain Filling & Ripening", duration: [20, 30] },
    {
      name: "Physiological Maturity/Harvest",
      duration: [0, 0],
      cumulative: [120, 170],
    }, // Total duration used here
  ],
  Corn: [
    { name: "Emergence (VE) & Seedling", duration: [4, 10] },
    { name: "Vegetative Growth (V1 to VT)", duration: [40, 60] },
    { name: "Tasseling (VT) & Silking (R1)", duration: [5, 10] },
    { name: "Kernel Development (R2 to R5)", duration: [30, 40] },
    {
      name: "Physiological Maturity (R6)",
      duration: [0, 0],
      cumulative: [90, 140],
    },
  ],
  Chickpea: [
    { name: "Germination & Emergence", duration: [7, 30] },
    { name: "Vegetative Growth (Branching)", duration: [60, 80] },
    { name: "Flowering (Early Bloom)", duration: [20, 30] },
    { name: "Pod Development & Filling", duration: [50, 90] },
    {
      name: "Physiological Maturity/Harvest",
      duration: [0, 0],
      cumulative: [140, 200],
    },
  ],
  Toor: [
    { name: "Germination & Emergence", duration: [10, 15] },
    { name: "Vegetative Growth", duration: [60, 120] },
    { name: "Flowering & Podding", duration: [30, 40] },
    { name: "Pod Filling & Maturity", duration: [40, 60] },
    {
      name: "Physiological Maturity/Harvest",
      duration: [0, 0],
      cumulative: [140, 250],
    },
  ],
  Cotton: [
    { name: "Emergence & Seedling", duration: [4, 14] },
    { name: "Vegetative Growth (Branching)", duration: [20, 40] },
    { name: "Squaring (Bud Formation)", duration: [25, 35] },
    { name: "Flowering & Boll Development", duration: [50, 70] },
    { name: "Boll Opening & Maturation", duration: [30, 50] },
    { name: "Harvest", duration: [0, 0], cumulative: [150, 200] },
  ],
};

export const CROP_OPTIONS = Object.keys(CROP_STAGES);
