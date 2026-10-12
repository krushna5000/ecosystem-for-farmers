// Pure DB I/O for farms_schema.farms / farm_crops / crops (+ the location chain). No business rules, no req/res.
// Rows keep the snake_case shape the farmer-app clients have always read (aliased in the SELECT or via snakeKeys).
import { eq, asc, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import {
  farms,
  farmCrops,
  crops,
  cropCategories,
  cropStages,
  pincodes,
  villages,
  cities,
  districts,
  states,
} from "./appFarm.schema.js";
import { FarmHistoricalWeather } from "../appWeather/appWeather.schema.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

const exec = (tx) => tx ?? db;

// farm + pincode / village / city / district / state names (old SELECT ... LEFT JOIN chain)
const locationFields = {
  pincode: pincodes.pincode,
  village_name: villages.villageName,
  city_name: cities.cityName,
  district_name: districts.districtName,
  state_name: states.stateName,
};

const farmWithLocation = (fields, tx) =>
  exec(tx)
    .select({ ...fields, ...locationFields })
    .from(farms)
    .leftJoin(pincodes, eq(farms.pincodeId, pincodes.pincodeId))
    .leftJoin(villages, eq(pincodes.villageId, villages.villageId))
    .leftJoin(cities, eq(villages.cityId, cities.cityId))
    .leftJoin(districts, eq(cities.districtId, districts.districtId))
    .leftJoin(states, eq(districts.stateId, states.stateId));

// all farm columns under their snake_case names (old `f.*`)
const snakeFarmFields = {
  id: farms.id,
  user_id: farms.userId,
  farm_name: farms.farmName,
  field_id: farms.fieldId,
  pincode_id: farms.pincodeId,
  farm_coordinates: farms.farmCoordinates,
  created_at: farms.createdAt,
};

const summaryFarmFields = {
  id: farms.id,
  farm_name: farms.farmName,
  created_at: farms.createdAt,
  user_id: farms.userId,
  pincode_id: farms.pincodeId,
  farm_coordinates: farms.farmCoordinates,
  field_id: farms.fieldId,
};

// farm_coordinates may arrive as an array or as an already JSON-stringified array
const toJsonValue = (v) => (typeof v === "string" ? JSON.parse(v) : v);

export async function createFarmInDB(userId, farmName, pincodeId, farmCoordinates, fieldId, tx) {
  const [row] = await exec(tx)
    .insert(farms)
    .values({
      userId,
      farmName,
      pincodeId,
      farmCoordinates: toJsonValue(farmCoordinates),
      fieldId,
    })
    .returning();
  return snakeKeys(row);
}

export function listFarmsByUserInDB(userId, tx) {
  return farmWithLocation(snakeFarmFields, tx).where(eq(farms.userId, userId));
}

export async function getFarmByIdInDB(farmId, tx) {
  const [row] = await farmWithLocation(summaryFarmFields, tx).where(eq(farms.id, farmId));
  return row;
}

// Every farm (used by the daily weather cron)
export function listAllFarmsInDB(tx) {
  return farmWithLocation(summaryFarmFields, tx);
}

// null/undefined fields keep the existing value (COALESCE)
export async function updateFarmInDB(farmId, farmName, pincodeId, farmCoordinates, tx) {
  const values = {};
  if (farmName != null) values.farmName = farmName;
  if (pincodeId != null) values.pincodeId = pincodeId;
  if (farmCoordinates != null) values.farmCoordinates = toJsonValue(farmCoordinates);

  if (Object.keys(values).length === 0) {
    const [row] = await exec(tx).select().from(farms).where(eq(farms.id, farmId));
    return snakeKeys(row);
  }

  const [row] = await exec(tx).update(farms).set(values).where(eq(farms.id, farmId)).returning();
  return snakeKeys(row);
}

export async function deleteFarmInDB(farmId, tx) {
  const [row] = await exec(tx).delete(farms).where(eq(farms.id, farmId)).returning();
  return snakeKeys(row);
}

// Updating the field id got from the Farmonaut API
export async function updateFarmFieldIdInDB(farmId, fieldId, tx) {
  const [row] = await exec(tx).update(farms).set({ fieldId }).where(eq(farms.id, farmId)).returning();
  return snakeKeys(row);
}

export async function createFarmCropInDB(farmId, cropId, sowingDate, tx) {
  const [row] = await exec(tx).insert(farmCrops).values({ farmId, cropId, sowingDate }).returning();
  return snakeKeys(row);
}

const farmCropWithName = (tx) =>
  exec(tx)
    .select({ ...getTableColumns(farmCrops), cropName: crops.cropName })
    .from(farmCrops)
    .innerJoin(crops, eq(farmCrops.cropId, crops.id));

export async function listFarmCropsByFarmInDB(farmId, tx) {
  return snakeRows(await farmCropWithName(tx).where(eq(farmCrops.farmId, farmId)));
}

export async function getFarmCropByIdInDB(id, tx) {
  const [row] = await farmCropWithName(tx).where(eq(farmCrops.id, id));
  return snakeKeys(row);
}

// null/undefined sowingDate keeps the existing value (COALESCE)
export async function updateFarmCropInDB(id, sowingDate, tx) {
  const [row] = await exec(tx)
    .update(farmCrops)
    .set({ sowingDate: sowingDate ?? undefined, updatedAt: new Date() })
    .where(eq(farmCrops.id, id))
    .returning();
  return snakeKeys(row);
}

export async function deleteFarmCropInDB(id, tx) {
  const [row] = await exec(tx).delete(farmCrops).where(eq(farmCrops.id, id)).returning();
  return snakeKeys(row);
}

export function listActivePincodesInDB(tx) {
  return exec(tx)
    .select({ pincode_id: pincodes.pincodeId, pincode: pincodes.pincode })
    .from(pincodes)
    .where(eq(pincodes.isActive, true))
    .orderBy(asc(pincodes.pincodeId));
}

export function listFarmCropsByUserInDB(userId, tx) {
  return exec(tx)
    .select({
      farm_crop_id: farmCrops.id,
      farm_id: farmCrops.farmId,
      farm_name: farms.farmName,
      crop_id: farmCrops.cropId,
      crop_name: crops.cropName,
      sowing_date: farmCrops.sowingDate,
    })
    .from(farmCrops)
    .innerJoin(farms, eq(farmCrops.farmId, farms.id))
    .innerJoin(crops, eq(farmCrops.cropId, crops.id))
    .where(eq(farms.userId, Number(userId)))
    .orderBy(asc(farmCrops.id));
}

export function listAllCropsInDB(tx) {
  return exec(tx)
    .select({
      crop_id: crops.id,
      crop_name: crops.cropName,
      category_id: crops.categoryId,
      category_name: cropCategories.categoryName,
      // crops.crop_stage_id is a jsonb array of { id, days, weeks } -> resolve stage names
      crop_stages: sql`COALESCE((
        SELECT json_agg(jsonb_build_object(
          'stage_id', ${cropStages.id},
          'stage_name', ${cropStages.stageName},
          'days', stg->>'days',
          'weeks', stg->>'weeks'
        ))
        FROM jsonb_array_elements(${crops.cropStageId}) AS stg
        JOIN ${cropStages} ON ${cropStages.id} = (stg->>'id')::int
      ), '[]'::json)`,
    })
    .from(crops)
    .leftJoin(cropCategories, eq(cropCategories.id, crops.categoryId))
    .orderBy(asc(crops.id));
}

// Mongo: the historical weather snapshot stored when a crop is sown in the past
export function createFarmHistoricalWeatherInDB(doc) {
  return FarmHistoricalWeather.create(doc);
}
