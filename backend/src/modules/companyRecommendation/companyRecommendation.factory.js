// Pure DB I/O for the product recommendation engine. No business rules, no req/res.
import { and, desc, eq, notInArray, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import {
  companyBrands,
  companyCategories,
  companySubCategories,
  companyProducts,
  crops,
} from "./companyRecommendation.schema.js";

const exec = (tx) => tx ?? db;

const p = companyProducts;

// `crop_id = ANY(crop_ids)`
const hasCrop = (cropId) => sql`${cropId} = ANY(${p.cropIds})`;

// EXISTS (SELECT 1 FROM unnest(disease_names) d WHERE LOWER(d) = LOWER(x))
const hasDisease = (diseaseName) =>
  sql`EXISTS (SELECT 1 FROM unnest(${p.diseaseNames}) d WHERE LOWER(d) = LOWER(${diseaseName}))`;

const hasChemical = (pattern) => sql`${p.chemicalComposition}::text ILIKE ${pattern}`;

// How each match tier narrows the catalogue.
const conditionsFor = (matchType, { cropId, disease, chemical }) => {
  switch (matchType) {
    case "exact":
      return [hasCrop(cropId), hasDisease(disease), hasChemical(chemical)];
    case "disease":
      return [hasCrop(cropId), hasDisease(disease)];
    case "chemical":
      return [hasCrop(cropId), hasChemical(chemical)];
    case "crop":
      return [hasCrop(cropId)];
    case "fallback":
      return [sql`(${hasDisease(disease)} OR ${hasChemical(chemical)})`];
    default:
      throw new Error(`Unknown recommendation match type: ${matchType}`);
  }
};

/** Exact (case-insensitive) crop-name lookup in farms_schema.crops. */
export async function findCropIdByNameInDB(name, tx) {
  const [crop] = await exec(tx)
    .select({ id: crops.id })
    .from(crops)
    .where(sql`LOWER(${crops.cropName}) = LOWER(${name})`)
    .limit(1);
  return crop?.id ?? null;
}

/** Partial crop-name lookup (e.g. "Corn (Maize)" matches "Corn" or "Maize"). */
export async function findCropIdByPartialNameInDB(name, tx) {
  const [crop] = await exec(tx)
    .select({ id: crops.id })
    .from(crops)
    .where(
      sql`LOWER(${name}) LIKE '%' || LOWER(${crops.cropName}) || '%'
              OR LOWER(${crops.cropName}) LIKE '%' || LOWER(${name}) || '%'`,
    )
    .limit(1);
  return crop?.id ?? null;
}

/** Active products for one match tier, newest first. */
export function findMatchingProductsInDB({ matchType, filters, excludeIds, limit }, tx) {
  return exec(tx)
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
        ...conditionsFor(matchType, filters),
        excludeIds.length > 0 ? notInArray(p.id, excludeIds) : undefined,
      ),
    )
    .orderBy(desc(p.createdAt))
    .limit(limit);
}
