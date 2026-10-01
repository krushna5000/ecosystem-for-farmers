import { and, eq } from "drizzle-orm";
import axios from "axios";
import { db } from "../../../../db/index.js";
import { pincodes } from "../../../../db/schema/index.js";
import { env } from "../../../../config/env.js";
import { addFarm } from "../../models/farmModel.js";
import { findUserByWhatsappNumber } from "./authService.js";

// Get user (id, full_name) from phone number — tries all stored phone formats
const getUserIdByPhone = async (phoneNumber) => {
  const user = await findUserByWhatsappNumber(phoneNumber);
  return user ? { id: user.id, full_name: user.full_name } : null;
};

// Get pincode_id from 6-digit pincode string
const getPincodeId = async (pincode) => {
  const [row] = await db
    .select({ pincodeId: pincodes.pincodeId })
    .from(pincodes)
    .where(and(eq(pincodes.pincode, pincode), eq(pincodes.isActive, true)))
    .limit(1);
  return row?.pincodeId || null;
};

// Convert acres to hectares (1 acre = 0.404686 hectares)
const acresToHectares = (acres) => {
  return parseFloat((acres * 0.404686).toFixed(4));
};

// Generate a square polygon from center lat/lng and area in hectares
const generatePolygon = (lat, lng, areaHectares) => {
  // area in m² = hectares * 10000
  const areaM2 = areaHectares * 10000;
  // side of square in meters
  const side = Math.sqrt(areaM2);
  // half side in degrees (approximate)
  const halfSideLat = (side / 2) / 111320;
  const halfSideLng = (side / 2) / (111320 * Math.cos(lat * Math.PI / 180));

  // Generate 4 corners of a square [lng, lat] format
  const coordinates = [
    [lng - halfSideLng, lat + halfSideLat], // top-left
    [lng + halfSideLng, lat + halfSideLat], // top-right
    [lng + halfSideLng, lat - halfSideLat], // bottom-right
    [lng - halfSideLng, lat - halfSideLat], // bottom-left
  ];

  return coordinates;
};

// Full add farm flow for WhatsApp
const addFarmFromWhatsapp = async ({ phoneNumber, farmName, pincode, areaAcres, lat, lng }) => {
  // 1. Get user_id from phone
  const user = await getUserIdByPhone(phoneNumber);
  if (!user) throw new Error("User not found");

  // 2. Get pincode_id
  const pincodeId = await getPincodeId(pincode);
  if (!pincodeId) throw new Error("Invalid pincode. This pincode is not available in our system.");

  // 3. Convert acres to hectares
  const areaHectares = acresToHectares(areaAcres);
  if (areaHectares > 10) throw new Error("Farm area cannot exceed 10 hectares (approx 24.7 acres).");

  // 4. Generate polygon from center + area
  const farmCoordinates = generatePolygon(lat, lng, areaHectares);

  // 5. Call Farmonaut API to register field
  const farmonautResponse = await axios.post(
    "https://us-central1-farmbase-b2f7e.cloudfunctions.net/submitField",
    {
      CropCode: "2",
      FieldName: farmName,
      PaymentType: 1,
      SowingDate: Math.floor(Date.now() / 1000).toString(),
      Points: farmCoordinates,
    },
    {
      headers: {
        Authorization: `Bearer ${env.farmonautApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const fieldId = farmonautResponse.data.FieldID;
  if (!fieldId) throw new Error("Failed to register field with satellite service");

  // 6. Save to DB
  const farm = await addFarm(
    user.id,
    farmName,
    pincodeId,
    JSON.stringify(farmCoordinates),
    fieldId
  );

  return {
    farm_id: farm.id,
    farm_name: farm.farm_name,
    area_hectares: areaHectares,
    area_acres: areaAcres,
    field_id: fieldId,
  };
};

export { getUserIdByPhone, getPincodeId, acresToHectares, generatePolygon, addFarmFromWhatsapp };
