import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendMenu } from "../services/whatsappService.js";
import { getFarmCropsByFarm, getFarmById } from "../models/farmModel.js";
import axios from "axios";

const WHATSAPP_API = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
const COMPANY_BACKEND_URL = process.env.COMPANY_BACKEND_URL || "http://localhost:5000";

function getHeaders() {
    return {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
    };
}

function getStrings(from) {
    const session = userSessions.get(from);
    return STRINGS[session?.language || "en"];
}

// 1. Fetch crops for the selected farm and show list
export async function handleCropTrackingSelected(from, session, farmId) {
    const s = getStrings(from);
    let farm = session?.selectedFarm;

    if (!farm && farmId) {
        farm = await getFarmById(farmId);
        if (farm) {
             userSessions.set(from, { ...session, selectedFarm: farm });
        }
    }

    if (!farm) {
        await sendMessage(from, "❌ Farm not found. Type *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu", selectedFarm: undefined });
        return;
    }

    try {
        const crops = await getFarmCropsByFarm(farm.id);
        
        if (!crops || crops.length === 0) {
            await sendMessage(from, s.cropTrackingNoCrops);
            userSessions.set(from, { ...session, step: "menu" });
            return;
        }

        userSessions.set(from, { ...session, step: "select_tracking_crop", farmCrops: crops, selectedFarm: farm });

        // Build interactive list
        const cropRows = crops.slice(0, 10).map((fc) => ({
            id: `tracking_crop_${fc.id}`,
            title: fc.crop_name.substring(0, 24),
            description: `Sown: ${new Date(fc.sowing_date).toISOString().split('T')[0]}`,
        }));

        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: s.farmActionTrackingTitle },
                body: { text: s.cropTrackingSelectPrompt },
                footer: { text: "Powered by FarmsEasy" },
                action: {
                    button: s.cropTrackingButton,
                    sections: [
                        {
                            title: "Your Crops",
                            rows: cropRows,
                        },
                    ],
                },
            },
        }, { headers: getHeaders() });

    } catch (err) {
        console.error("Fetch Farm Crops Error:", err.message);
        await sendMessage(from, "❌ Failed to fetch your crops. Please try again.\n\nType *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu" });
    }
}

// 2. Handle crop selection and call WebApp CLSM API
export async function handleTrackingCropSelected(from, cropId) {
    const session = userSessions.get(from);
    const s = getStrings(from);

    const farmCrop = session?.farmCrops?.find(fc => fc.id === parseInt(cropId));
    const farm = session?.selectedFarm;

    if (!farmCrop || !farm) {
        await sendMessage(from, "❌ Crop or Farm not found. Type *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu", farmCrops: undefined, selectedFarm: undefined });
        return;
    }

    await sendMessage(from, s.cropAnalysisStarted);

    try {
        const response = await axios.post(`${COMPANY_BACKEND_URL}/api/CLSM/infer`, {
            farm_id: farm.id,
            field_id: farm.field_id,
            crop_name: farmCrop.crop_name,
            sowing_date: new Date(farmCrop.sowing_date).toISOString().split('T')[0],
            current_date: new Date().toISOString().split('T')[0],
            user_id: farm.user_id
        });

        if (response.data && response.data.success) {
            const clsmMessage = s.clsmTemplate(response.data.data);
            await sendMessage(from, clsmMessage);
        } else {
            throw new Error(response.data?.message || "Invalid CLSM response");
        }
    } catch (err) {
        console.error("CLSM API Error:", err.response?.data || err.message);
        await sendMessage(from, s.clsmTrackingError);
    }

    // Reset flow and auto-show menu
    userSessions.set(from, { 
        ...session, 
        step: "menu", 
        selectedFarm: undefined, 
        farmCrops: undefined 
    });
    await sendMenu(from, session?.userName || "there", session?.language || "en");
}
