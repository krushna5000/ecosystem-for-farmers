import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendFarmList, sendFarmActionMenu, sendMenu } from "../services/whatsappService.js";
import { getUserIdByPhone } from "../controllers/farmController.js";
import { getFarmsByUser, getFarmById } from "../models/farmModel.js";

function getStrings(from) {
    const session = userSessions.get(from);
    return STRINGS[session?.language || "en"];
}

// Handle "My Farms" selected from main menu
export async function handleMyFarmsSelected(from, session) {
    const s = getStrings(from);
    const whatsappNumber = from.startsWith("91") ? from : `91${from}`;

    try {
        const user = await getUserIdByPhone(whatsappNumber);
        if (!user) {
            await sendMessage(from, "User not found. Send any message to get started!");
            return;
        }

        const farms = await getFarmsByUser(user.id);

        if (!farms || farms.length === 0) {
            await sendMessage(from, s.noFarms);
            userSessions.set(from, { ...session, step: "menu" });
            return;
        }

        // Store farms in session for later reference
        userSessions.set(from, { ...session, step: "select_farm", farms });

        // Send farm list as interactive list
        await sendFarmList(from, farms, s);
    } catch (err) {
        console.error("My Farms Error:", err.message);
        await sendMessage(from, "Failed to fetch your farms. Please try again.\n\nType *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu" });
    }
}

// Handle farm selection from the list
export async function handleFarmSelected(from, farmId) {
    const session = userSessions.get(from);
    const s = getStrings(from);

    // Find the selected farm from session
    const farm = session?.farms?.find(f => f.id === parseInt(farmId));

    if (!farm) {
        await sendMessage(from, "❌ Farm not found. Type *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu", farms: undefined });
        return;
    }

    // Set step to farm_action and save the selected farm
    userSessions.set(from, { ...session, step: "farm_action", selectedFarm: farm });

    // Send action menu
    await sendFarmActionMenu(from, farm, s);
}

// Handle "Farm Information" selected from sub-menu
export async function handleFarmInfoSelected(from, session, farmId) {
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

    // Send farm details
    const details = s.farmDetailsTemplate(farm);
    await sendMessage(from, details);

    // Reset to menu and auto-show
    userSessions.set(from, { ...session, step: "menu", farms: undefined, selectedFarm: undefined });
    await sendMenu(from, session?.userName || "there", session?.language || "en");
}

// Check if user is in farm selection flow
export function isInMyFarmFlow(from) {
    const session = userSessions.get(from);
    return session?.step === "select_farm" || session?.step === "farm_action";
}
