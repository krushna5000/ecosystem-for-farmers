// @module-kind service — no HTTP surface; consumed by companyProduct and appCropAi.
import {
  findCropIdByNameInDB,
  findCropIdByPartialNameInDB,
  findMatchingProductsInDB,
} from "./companyRecommendation.factory.js";
import { snakeRows } from "../../utils/rowCase.js";

const MAX_RESULTS = 5;

/**
 * Product recommendations for a crop / disease / chemical, best match first (max 5).
 * Shared by the public company endpoint and the farmer app's crop-ai analysis.
 * Priority: exact (crop+disease+chemical) > disease > chemical > crop only > disease-or-chemical.
 *
 * @returns {Promise<{cropIdResolved: number|null, breakdown: object, data: object[]}>}
 */
export async function findRecommendations({ cropName, diseaseName, chemicalComposition }) {
  /* RESOLVE cropName → cropId from farms_schema.crops */
  let cropIdNum = null;

  if (cropName) {
    const name = cropName.trim();
    // Exact match first, then a partial match. A crop that is not in our DB is fine: other filters may match.
    cropIdNum = (await findCropIdByNameInDB(name)) ?? (await findCropIdByPartialNameInDB(name));
  }

  const disease = diseaseName?.trim();
  const chemical = chemicalComposition ? `%${chemicalComposition.trim()}%` : null;
  const filters = { cropId: cropIdNum, disease, chemical };

  const runTier = (matchType, excludeIds, limit) =>
    findMatchingProductsInDB({ matchType, filters, excludeIds, limit });

  /* Priority 1 — EXACT: crop AND disease AND chemical */
  let exactMatch = [];
  if (cropIdNum && diseaseName && chemicalComposition) {
    exactMatch = await runTier("exact", [], MAX_RESULTS);
  }
  let excludeIds = exactMatch.map((r) => r.id);

  /* Priority 2 — DISEASE: crop AND disease */
  let diseaseMatch = [];
  const remaining2 = MAX_RESULTS - excludeIds.length;
  if (remaining2 > 0 && cropIdNum && diseaseName) {
    diseaseMatch = await runTier("disease", excludeIds, remaining2);
  }
  excludeIds = [...excludeIds, ...diseaseMatch.map((r) => r.id)];

  /* Priority 3 — CHEMICAL: crop AND chemical */
  let chemicalMatch = [];
  const remaining3 = MAX_RESULTS - excludeIds.length;
  if (remaining3 > 0 && cropIdNum && chemicalComposition) {
    chemicalMatch = await runTier("chemical", excludeIds, remaining3);
  }
  excludeIds = [...excludeIds, ...chemicalMatch.map((r) => r.id)];

  /* Priority 4 — CROP ONLY */
  let cropMatch = [];
  const remaining4 = MAX_RESULTS - excludeIds.length;
  if (remaining4 > 0 && cropIdNum) {
    cropMatch = await runTier("crop", excludeIds, remaining4);
  }
  excludeIds = [...excludeIds, ...cropMatch.map((r) => r.id)];

  /* Priority 5 — DISEASE OR CHEMICAL ONLY (no crop match) */
  let fallbackMatch = [];
  const remaining5 = MAX_RESULTS - excludeIds.length;
  if (remaining5 > 0 && diseaseName && chemicalComposition) {
    fallbackMatch = await runTier("fallback", excludeIds, remaining5);
  }

  return {
    cropIdResolved: cropIdNum,
    breakdown: {
      exact_match: exactMatch.length,
      disease_match: diseaseMatch.length,
      chemical_match: chemicalMatch.length,
      crop_match: cropMatch.length,
      fallback_match: fallbackMatch.length,
    },
    data: snakeRows([
      ...exactMatch,
      ...diseaseMatch,
      ...chemicalMatch,
      ...cropMatch,
      ...fallbackMatch,
    ]),
  };
}
