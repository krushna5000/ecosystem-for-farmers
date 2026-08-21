import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendMenu } from "../services/whatsappService.js";
import { getAllCrops, addFarmCrop, getFarmById } from "../models/farmModel.js";
import axios from "axios";

const WHATSAPP_API = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;

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

// 1. Send the list of crops
export async function handleAddCropSelected(from, session, farmId) {
    const s = getStrings(from);
    let farm = session?.selectedFarm;

    if (!farm && farmId) {
        farm = await getFarmById(farmId);
        if (farm) {
            userSessions.set(from, { ...session, selectedFarm: farm });
        }
    }

    if (!farm) {
        await sendMessage(from, "Farm not found. Type *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu", selectedFarm: undefined });
        return;
    }

    try {
        const crops = await getAllCrops();

        if (!crops || crops.length === 0) {
            await sendMessage(from, "No crops available in database. Type *menu* to go back.");
            userSessions.set(from, { ...session, step: "menu" });
            return;
        }

        userSessions.set(from, { ...session, step: "select_crop", allCrops: crops, selectedFarm: farm });

        // Build interactive list
        const cropRows = crops.slice(0, 10).map((crop) => ({
            id: `crop_select_${crop.crop_id}`,
            title: crop.crop_name.substring(0, 24),
            description: "",
        }));

        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to: from,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: s.cropAddSelectHeader },
                body: { text: s.cropAddSelectPrompt },
                footer: { text: "Powered by FarmsEasy" },
                action: {
                    button: s.cropAddButton,
                    sections: [
                        {
                            title: "Crops",
                            rows: cropRows,
                        },
                    ],
                },
            },
        }, { headers: getHeaders() });

    } catch (err) {
        console.error("Fetch Crops Error:", err.message);
        await sendMessage(from, "Failed to fetch crops. Please try again.\n\nType *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu" });
    }
}

// 2. Handle crop selection and ask for date
export async function handleCropSelected(from, cropId) {
    const session = userSessions.get(from);
    const s = getStrings(from);

    const crop = session?.allCrops?.find(c => c.crop_id === parseInt(cropId));

    if (!crop || !session?.selectedFarm) {
        await sendMessage(from, "Crop or Farm not found. Type *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu", allCrops: undefined });
        return;
    }

    userSessions.set(from, {
        ...session,
        step: "enter_sowing_date",
        selectedCrop: crop
    });

    await sendMessage(from, s.cropAddAskDate);
}

// 3. Handle sowing date text input and save crop
export async function handleSowingDateInput(from, message) {
    const session = userSessions.get(from);
    const s = getStrings(from);

    const dateStr = message.text?.body?.trim();

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
        await sendMessage(from, s.cropAddInvalidDate);
        return true;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        await sendMessage(from, s.cropAddInvalidDate);
        return true;
    }

    await sendMessage(from, s.cropAdding);

    try {
        await addFarmCrop(session.selectedFarm.id, session.selectedCrop.crop_id, dateStr);

        const successMsg = s.cropAdded
            .replace("{cropName}", session.selectedCrop.crop_name)
            .replace("{sowingDate}", dateStr);

        await sendMessage(from, successMsg);
    } catch (err) {
        console.error("Add Farm Crop Error:", err.message);
        await sendMessage(from, "Failed to add crop to farm. Please try again.\n\nType *menu* to go back.");
    }

    // Reset flow and auto-show menu
    userSessions.set(from, {
        ...session,
        step: "menu",
        selectedFarm: undefined,
        selectedCrop: undefined,
        allCrops: undefined
    });
    await sendMenu(from, session?.userName || "there", session?.language || "en");

    return true;
}

export function isInCropManagementFlow(from) {
    const session = userSessions.get(from);
    return session?.step === "select_crop" || session?.step === "enter_sowing_date";
}
