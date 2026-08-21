export const safeNumber = (val) =>
  typeof val === "number" && !isNaN(val) ? val : 0;

export const invert = (value) => 100 - safeNumber(value);

export const mean = (arr) => {
  const safeArr = arr.map(safeNumber);
  return safeArr.reduce((a, b) => a + b, 0) / safeArr.length;
};

export const clip = (value) =>
  Math.max(0, Math.min(100, safeNumber(value)));
