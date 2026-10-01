import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  companyBrands,
  companyCategories,
  companySubCategories,
  companyProducts,
  crops,
} from "../../../db/schema/index.js";
import { snakeRows } from "../../../lib/rowCase.js";

const p = companyProducts;

// `crop_id = ANY(crop_ids)`
const hasCrop = (cropId) => sql`${cropId} = ANY(${p.cropIds})`;

// EXISTS (SELECT 1 FROM unnest(disease_names) d WHERE LOWER(d) = LOWER(x))
const hasDisease = (diseaseName) =>
  sql`EXISTS (SELECT 1 FROM unnest(${p.diseaseNames}) d WHERE LOWER(d) = LOWER(${diseaseName}))`;

const hasChemical = (pattern) => sql`${p.chemicalComposition}::text ILIKE ${pattern}`;

// Active products only
const runMatch = (matchType, conditions, excludeIds, limit) =>
  db
    .select({
      id: p.id,
      productName: p.productName,
      description: p.description,
      chemicalComposition: p.chemicalComposition,
      cropIds: p.cropIds,
      diseaseNames: p.diseaseNames,
      image: p.image,
      brandName: companyBrands.brandName,
      categoryName: companyCategories.categoryName,
      subCategoryName: companySubCategories.subCategoryName,
      match_type: sql`${matchType}::text`.as("match_type"),
    })
    .from(p)
    .innerJoin(companyBrands, eq(p.brandId, companyBrands.id))
    .innerJoin(companyCategories, eq(p.categoryId, companyCategories.id))
    .innerJoin(companySubCategories, eq(p.subCategoryId, companySubCategories.id))
    .where(
      and(
        eq(p.status, true),
        ...conditions,
        excludeIds.length > 0 ? notInArray(p.id, excludeIds) : undefined,
      ),
    )
    .orderBy(desc(p.createdAt))
    .limit(limit);

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

    // Exact match first
    let [crop] = await db
      .select({ id: crops.id })
      .from(crops)
      .where(sql`LOWER(${crops.cropName}) = LOWER(${name})`)
      .limit(1);

    // Fallback: partial match (e.g. "Corn (Maize)" matches "Corn" or "Maize")
    if (!crop) {
      [crop] = await db
        .select({ id: crops.id })
        .from(crops)
        .where(
          sql`LOWER(${name}) LIKE '%' || LOWER(${crops.cropName}) || '%'
              OR LOWER(${crops.cropName}) LIKE '%' || LOWER(${name}) || '%'`,
        )
        .limit(1);
    }

    if (crop) cropIdNum = crop.id;
    // Crop not in our DB: still continue — other filters may match
  }

  const disease = diseaseName?.trim();
  const chemical = chemicalComposition ? `%${chemicalComposition.trim()}%` : null;

  /* Priority 1 — EXACT: crop AND disease AND chemical */
  let exactMatch = [];
  if (cropIdNum && diseaseName && chemicalComposition) {
    exactMatch = await runMatch(
      "exact",
      [hasCrop(cropIdNum), hasDisease(disease), hasChemical(chemical)],
      [],
      5,
    );
  }
  let excludeIds = exactMatch.map((r) => r.id);

  /* Priority 2 — DISEASE: crop AND disease */
  let diseaseMatch = [];
  const remaining2 = 5 - excludeIds.length;
  if (remaining2 > 0 && cropIdNum && diseaseName) {
    diseaseMatch = await runMatch(
      "disease",
      [hasCrop(cropIdNum), hasDisease(disease)],
      excludeIds,
      remaining2,
    );
  }
  excludeIds = [...excludeIds, ...diseaseMatch.map((r) => r.id)];

  /* Priority 3 — CHEMICAL: crop AND chemical */
  let chemicalMatch = [];
  const remaining3 = 5 - excludeIds.length;
  if (remaining3 > 0 && cropIdNum && chemicalComposition) {
    chemicalMatch = await runMatch(
      "chemical",
      [hasCrop(cropIdNum), hasChemical(chemical)],
      excludeIds,
      remaining3,
    );
  }
  excludeIds = [...excludeIds, ...chemicalMatch.map((r) => r.id)];

  /* Priority 4 — CROP ONLY */
  let cropMatch = [];
  const remaining4 = 5 - excludeIds.length;
  if (remaining4 > 0 && cropIdNum) {
    cropMatch = await runMatch("crop", [hasCrop(cropIdNum)], excludeIds, remaining4);
  }
  excludeIds = [...excludeIds, ...cropMatch.map((r) => r.id)];

  /* Priority 5 — DISEASE OR CHEMICAL ONLY (no crop match) */
  let fallbackMatch = [];
  const remaining5 = 5 - excludeIds.length;
  if (remaining5 > 0 && diseaseName && chemicalComposition) {
    fallbackMatch = await runMatch(
      "fallback",
      [sql`(${hasDisease(disease)} OR ${hasChemical(chemical)})`],
      excludeIds,
      remaining5,
    );
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
