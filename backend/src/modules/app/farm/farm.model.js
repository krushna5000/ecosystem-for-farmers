import { eq, asc, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../../db/connection.js";
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
} from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";

// farm + pincode / village / city / district / state names (old SELECT ... LEFT JOIN chain)
const locationFields = {
  pincode: pincodes.pincode,
  village_name: villages.villageName,
  city_name: cities.cityName,
  district_name: districts.districtName,
  state_name: states.stateName,
};

const farmWithLocation = (fields) =>
  db
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

const addFarm = async (user_id, farm_name, pincode_id, farm_coordinates, field_id) => {
  const [row] = await db
    .insert(farms)
    .values({
      userId: user_id,
      farmName: farm_name,
      pincodeId: pincode_id,
      farmCoordinates: toJsonValue(farm_coordinates),
      fieldId: field_id,
    })
    .returning();
  return snakeKeys(row);
};

const getFarmsByUser = async (user_id) =>
  farmWithLocation(snakeFarmFields).where(eq(farms.userId, user_id));

const getFarmById = async (farm_id) => {
  const [row] = await farmWithLocation(summaryFarmFields).where(eq(farms.id, farm_id));
  return row;
};

// Get all farms (for cron job)
const getAllFarms = async () => farmWithLocation(summaryFarmFields);

// null/undefined fields keep the existing value (COALESCE)
const updateFarm = async (farm_id, farm_name, pincode_id, farm_coordinates) => {
  const values = {};
  if (farm_name != null) values.farmName = farm_name;
  if (pincode_id != null) values.pincodeId = pincode_id;
  if (farm_coordinates != null) values.farmCoordinates = toJsonValue(farm_coordinates);

  if (Object.keys(values).length === 0) {
    const [row] = await db.select().from(farms).where(eq(farms.id, farm_id));
    return snakeKeys(row);
  }

  const [row] = await db.update(farms).set(values).where(eq(farms.id, farm_id)).returning();
  return snakeKeys(row);
};

const deleteFarm = async (farm_id) => {
  const [row] = await db.delete(farms).where(eq(farms.id, farm_id)).returning();
  return snakeKeys(row);
};

const addFarmCrop = async (farm_id, crop_id, sowing_date) => {
  const [row] = await db
    .insert(farmCrops)
    .values({ farmId: farm_id, cropId: crop_id, sowingDate: sowing_date })
    .returning();
  return snakeKeys(row);
};

const farmCropWithName = () =>
  db
    .select({ ...getTableColumns(farmCrops), cropName: crops.cropName })
    .from(farmCrops)
    .innerJoin(crops, eq(farmCrops.cropId, crops.id));

const getFarmCropsByFarm = async (farm_id) =>
  snakeRows(await farmCropWithName().where(eq(farmCrops.farmId, farm_id)));

const getFarmCropById = async (id) => {
  const [row] = await farmCropWithName().where(eq(farmCrops.id, id));
  return snakeKeys(row);
};

// null/undefined sowing_date keeps the existing value (COALESCE)
const updateFarmCrop = async (id, sowing_date) => {
  const [row] = await db
    .update(farmCrops)
    .set({ sowingDate: sowing_date ?? undefined, updatedAt: new Date() })
    .where(eq(farmCrops.id, id))
    .returning();
  return snakeKeys(row);
};

const deleteFarmCrop = async (id) => {
  const [row] = await db.delete(farmCrops).where(eq(farmCrops.id, id)).returning();
  return snakeKeys(row);
};

const getAllActivePincodes = async () =>
  db
    .select({ pincode_id: pincodes.pincodeId, pincode: pincodes.pincode })
    .from(pincodes)
    .where(eq(pincodes.isActive, true))
    .orderBy(asc(pincodes.pincodeId));

const getFarmCropsByUser = async (user_id) =>
  db
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
    .where(eq(farms.userId, Number(user_id)))
    .orderBy(asc(farmCrops.id));

const getAllCrops = async () =>
  db
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

// Updating field id got from Farmonaut_API
const updateFarmFieldId = async (farm_id, field_id) => {
  const [row] = await db.update(farms).set({ fieldId: field_id }).where(eq(farms.id, farm_id)).returning();
  return snakeKeys(row);
};

export {
  addFarm,
  getFarmsByUser,
  getFarmById,
  getAllFarms,
  updateFarm,
  deleteFarm,
  addFarmCrop,
  getFarmCropsByFarm,
  getFarmCropById,
  updateFarmCrop,
  deleteFarmCrop,
  getAllActivePincodes,
  getFarmCropsByUser,
  getAllCrops,
  updateFarmFieldId,
};
