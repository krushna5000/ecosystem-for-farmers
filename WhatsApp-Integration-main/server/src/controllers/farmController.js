import db from "../config/db.js";
import { addFarm, getFarmsByUser } from "../models/farmModel.js";
import { normalizePhone } from "./authController.js";
// import axios from "axios";

// Get user_id from phone number
const getUserIdByPhone = async (phoneNumber) => {
    const raw10 = normalizePhone(phoneNumber);
    const with91 = `91${raw10}`;
    const withPlus91 = `+91${raw10}`;

    const result = await db.query(
        `SELECT id, full_name FROM user_schema.users 
     WHERE phone_number = $1 OR phone_number = $2 OR phone_number = $3 
     LIMIT 1`,
        [raw10, with91, withPlus91]
    );
    return result.rows[0] || null;
};

// Get all farms for a user by phone number
export const getMyFarms = async (phoneNumber) => {
    const user = await getUserIdByPhone(phoneNumber);
    if (!user) return [];
    return await getFarmsByUser(user.id);
};

// Get pincode_id from 6-digit pincode string
const getPincodeId = async (pincode) => {
    const result = await db.query(
        `SELECT pincode_id FROM location_schema.pincodes 
     WHERE pincode = $1 AND is_active = true 
     LIMIT 1`,
        [pincode]
    );
    return result.rows[0]?.pincode_id || null;
};

// Convert acres to hectares (1 acre = 0.404686 hectares)
const acresToHectares = (acres) => {
    return parseFloat((acres * 0.404686).toFixed(4));
};

// Generate a square polygon from center lat/lng and area in hectares
const generatePolygon = (lat, lng, areaHectares) => {
    const areaM2 = areaHectares * 10000;
    const side = Math.sqrt(areaM2);
    const halfSideLat = (side / 2) / 111320;
    const halfSideLng = (side / 2) / (111320 * Math.cos(lat * Math.PI / 180));

    const coordinates = [
        [lng - halfSideLng, lat + halfSideLat], // top-left
        [lng + halfSideLng, lat + halfSideLat], // top-right
        [lng + halfSideLng, lat - halfSideLat], // bottom-right
        [lng - halfSideLng, lat - halfSideLat], // bottom-left
    ];

    return coordinates;
};

// Full add farm flow — core logic from WebApp controllers/whatsapp/farmController.js
// + services/whatsapp/farmService.js
export const addFarmFromWhatsapp = async ({ phoneNumber, farmName, pincode, areaAcres, lat, lng }) => {
    if (!phoneNumber || !farmName || !pincode || !areaAcres || !lat || !lng) {
        throw new Error("All fields required: phoneNumber, farmName, pincode, areaAcres, lat, lng");
    }

    // 1. Get user_id from phone
    const user = await getUserIdByPhone(phoneNumber);
    if (!user) throw new Error("User not found");

    // 2. Get pincode_id
    const pincodeId = await getPincodeId(pincode);
    if (!pincodeId) throw new Error("Invalid pincode. This pincode is not available in our system.");

    // 3. Convert acres to hectares
    const areaHectares = acresToHectares(parseFloat(areaAcres));
    if (areaHectares > 10) throw new Error("Farm area cannot exceed 10 hectares (approx 24.7 acres).");

    // 4. Generate polygon from center + area
    const farmCoordinates = generatePolygon(parseFloat(lat), parseFloat(lng), areaHectares);

    // 5. Call Farmonaut API to register field (COMMENTED OUT - keeping location only)
    /* FARMONAUT API DISABLED - Just save location to DB
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
                Authorization: `Bearer ${process.env.FARMONAUT_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    const fieldId = farmonautResponse.data.FieldID;
    if (!fieldId) throw new Error("Failed to register field with satellite service");
    */

    // 6. Save to DB
    const farm = await addFarm(
        user.id,
        farmName,
        pincodeId,
        JSON.stringify(farmCoordinates),
        null  // field_id set to null - FarmOnaut API disabled
    );

    return {
        farm_id: farm.id,
        farm_name: farm.farm_name,
        area_hectares: areaHectares,
        area_acres: parseFloat(areaAcres),
    };
};

export { getUserIdByPhone, getPincodeId, acresToHectares, generatePolygon };
