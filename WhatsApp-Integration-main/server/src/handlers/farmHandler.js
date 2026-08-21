import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendMenu } from "../services/whatsappService.js";
import { addFarmViaApi } from "../services/farmService.js";

function getStrings(from) {
    const session = userSessions.get(from);
    return STRINGS[session?.language || "en"];
}

export async function handleAddFarmSelected(from, session) {
    const lang = session?.language || "en";
    userSessions.set(from, { ...session, step: "farm_name" });
    const s = STRINGS[lang] || STRINGS.en;
    await sendMessage(from, s.farmAskName);
}

export async function handleFarmStep(from, message, userName) {
    const session = userSessions.get(from);
    if (!session) return false;

    const s = getStrings(from);
    const step = session.step;

    // Step 1: Farm Name
    if (step === "farm_name" && message.type === "text") {
        const farmName = message.text?.body?.trim();
        if (!farmName || farmName.length < 2) {
            await sendMessage(from, s.farmNameInvalid);
            return true;
        }
        userSessions.set(from, { ...session, step: "farm_pincode", farmData: { farmName } });
        await sendMessage(from, s.farmAskPincode);
        return true;
    }

    // Step 2: Pincode
    if (step === "farm_pincode" && message.type === "text") {
        const pincode = message.text?.body?.trim();
        if (!/^\d{6}$/.test(pincode)) {
            await sendMessage(from, s.farmPincodeInvalid);
            return true;
        }
        userSessions.set(from, {
            ...session,
            step: "farm_area",
            farmData: { ...session.farmData, pincode },
        });
        await sendMessage(from, s.farmAskArea);
        return true;
    }

    // Step 3: Area in Acres
    if (step === "farm_area" && message.type === "text") {
        const areaText = message.text?.body?.trim();
        const areaAcres = parseFloat(areaText);
        if (isNaN(areaAcres) || areaAcres <= 0) {
            await sendMessage(from, s.farmAreaInvalid);
            return true;
        }
        if (areaAcres > 24.7) {
            await sendMessage(from, s.farmAreaTooLarge);
            return true;
        }
        userSessions.set(from, {
            ...session,
            step: "farm_location",
            farmData: { ...session.farmData, areaAcres },
        });
        await sendMessage(from, s.farmAskLocation);
        return true;
    }

    // Step 4: Location (WhatsApp location message)
    if (step === "farm_location") {
        if (message.type === "location") {
            const lat = message.location.latitude;
            const lng = message.location.longitude;

            const farmData = {
                ...session.farmData,
                lat,
                lng,
            };

            userSessions.set(from, { ...session, step: "farm_confirm", farmData });

            const confirmMsg = s.farmConfirm
                .replace("{farmName}", farmData.farmName)
                .replace("{pincode}", farmData.pincode)
                .replace("{area}", farmData.areaAcres)
                .replace("{lat}", lat.toFixed(6))
                .replace("{lng}", lng.toFixed(6));

            await sendMessage(from, confirmMsg);
            return true;
        } else {
            await sendMessage(from, s.farmLocationInvalid);
            return true;
        }
    }

    // Step 5: Confirmation (yes/no)
    if (step === "farm_confirm" && message.type === "text") {
        const text = message.text?.body?.trim().toLowerCase();

        if (text === "yes" || text === "y" || text === "ha" || text === "haa" || text === "ho") {
            await sendMessage(from, s.farmAdding);

            const whatsappNumber = from.startsWith("91") ? from : `91${from}`;

            try {
                const result = await addFarmViaApi({
                    phoneNumber: whatsappNumber,
                    farmName: session.farmData.farmName,
                    pincode: session.farmData.pincode,
                    areaAcres: session.farmData.areaAcres,
                    lat: session.farmData.lat,
                    lng: session.farmData.lng,
                });

                const successMsg = s.farmAdded
                    .replace("{farmName}", result.farm_name)
                    .replace("{area}", result.area_acres)
                    .replace("{hectares}", result.area_hectares);

                await sendMessage(from, successMsg);
            } catch (err) {
                console.error("Add Farm Error:", err.response?.data || err.message);
                const errorMsg = err.response?.data?.message || "Failed to add farm";
                await sendMessage(from, `${errorMsg}\n\nType *menu* to go back.`);
            }

            // Reset to menu and auto-show
            userSessions.set(from, {
                ...session,
                step: "menu",
                farmData: undefined,
            });
            await sendMenu(from, userName, session?.language || "en");
            return true;
        } else if (text === "no" || text === "n" || text === "nahi" || text === "nako") {
            await sendMessage(from, s.farmCancelled);
            userSessions.set(from, {
                ...session,
                step: "menu",
                farmData: undefined,
            });
            await sendMenu(from, userName, session?.language || "en");
            return true;
        } else {
            await sendMessage(from, s.farmConfirmInvalid);
            return true;
        }
    }

    return false;
}

// Check if user is in any farm flow step
export function isInFarmFlow(from) {
    const session = userSessions.get(from);
    const farmSteps = ["farm_name", "farm_pincode", "farm_area", "farm_location", "farm_confirm"];
    return farmSteps.includes(session?.step);
}
