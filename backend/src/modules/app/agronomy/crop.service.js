import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { crops, cropCategories, cropStages, farmCrops } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";

const toInt = (v) => (v === null || v === undefined || v === "" ? null : Math.trunc(Number(v)));

// crop master data + category + its stage windows (crops.crop_stage_id is a jsonb array of
// { id, das_min, das_max, gdd_min, gdd_max } referencing farms_schema.crop_stages)
export const getCropById = async (crop_id) => {
  try {
    const id = Number(crop_id);
    if (!Number.isInteger(id)) return null;

    const [row] = await db
      .select({
        id: crops.id,
        crop_name: crops.cropName,
        t_base: crops.tBase,
        created_at: crops.createdAt,
        category_id: cropCategories.id,
        category_name: cropCategories.categoryName,
        crop_stage_id: crops.cropStageId,
      })
      .from(crops)
      .leftJoin(cropCategories, eq(cropCategories.id, crops.categoryId))
      .where(eq(crops.id, id));

    if (!row) return null;

    const { crop_stage_id, ...crop } = row;
    const elements = Array.isArray(crop_stage_id) ? crop_stage_id : [];

    const stageIds = [...new Set(elements.map((s) => toInt(s?.id)).filter((v) => v !== null))];
    const stageRows = stageIds.length
      ? await db
          .select({ id: cropStages.id, stageName: cropStages.stageName })
          .from(cropStages)
          .where(inArray(cropStages.id, stageIds))
      : [];
    const stageNames = new Map(stageRows.map((s) => [s.id, s.stageName]));

    return {
      ...crop,
      crop_stages: elements.map((s) => ({
        id: toInt(s?.id),
        stage_name: stageNames.get(toInt(s?.id)) ?? null,
        das_min: toInt(s?.das_min),
        das_max: toInt(s?.das_max),
        gdd_min: toInt(s?.gdd_min),
        gdd_max: toInt(s?.gdd_max),
      })),
    };
  } catch (err) {
    console.error("getCropById:", err.message);
    throw err;
  }
};

export const getFarmCrop = async (farm_id, crop_id) => {
  const [row] = await db
    .select({ farmCrop: farmCrops, crop_name: crops.cropName })
    .from(farmCrops)
    .innerJoin(crops, eq(farmCrops.cropId, crops.id))
    .where(and(eq(farmCrops.farmId, Number(farm_id)), eq(farmCrops.cropId, Number(crop_id))));

  return row ? { ...snakeKeys(row.farmCrop), crop_name: row.crop_name } : null;
};

export default {
  getCropById,
  getFarmCrop,
};
