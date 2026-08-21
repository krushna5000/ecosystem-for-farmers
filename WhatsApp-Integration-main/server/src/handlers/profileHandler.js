import { userSessions } from "../config/session.js";
import { sendMessage, sendMenu } from "../services/whatsappService.js";
import { getOnboardingRecord } from "../models/onboardingModel.js";
import { STRINGS } from "../config/constants.js";
import { startOnboarding } from "./onboardingHandler.js";

// Normalize language code
function normalizeLanguage(langValue) {
    if (!langValue) return "en";
    const langMap = {
        "en": "en", "english": "en",
        "hi": "hi", "hindi": "hi",
        "mr": "mr", "marathi": "mr",
    };
    return langMap[langValue] || "en";
}

function getStrings(from) {
    const session = userSessions.get(from);
    const normalizedLang = normalizeLanguage(session?.language);
    return STRINGS[normalizedLang];
}

/**
 * Handle Profile selection from main menu
 * Displays: Name, Location (State/District/Village), Land Size, Language
 * Excludes: Current Crop, Sowing Date (can change anytime)
 */
export async function handleProfileSelected(from, session, userName) {
    try {
        console.log(`👤 [PROFILE] User ${from} selected profile view, userId: ${session?.userId}`);

        if (!session?.userId) {
            const s = getStrings(from);
            await sendMessage(from, "❌ User profile not found. Please start over.");
            return;
        }

        // Fetch onboarding data from database
        const profile = await getOnboardingRecord(session.userId);
        console.log(`👤 [PROFILE] Fetched onboarding record for user ${session.userId}:`, profile);

        // If no profile exists or onboarding not completed, start onboarding
        if (!profile || !profile.is_completed) {
            console.log(`[PROFILE] Onboarding not completed. Starting onboarding for user ${session.userId}...`);
            await startOnboarding(from, userName, session.userId, session);
            console.log(`[PROFILE] Onboarding started successfully`);
            return;
        }

        // Build profile information (exclude crop and sowing date)
        const profileInfo = formatProfileMessage(profile, session.language, userName);

        console.log(`✅ [PROFILE] Displaying profile for user ${from}`, profileInfo);
        await sendMessage(from, profileInfo, true); // Skip auto-translation

        // Send back to menu
        userSessions.set(from, { ...session, step: "menu" });
        await sendMenu(from, userName, session.language || "en");

    } catch (error) {
        console.error(`❌ [PROFILE] Error:`, error.message, error.stack);
        const s = getStrings(from);
        await sendMessage(from, "❌ Error loading profile. Please try again.");
        userSessions.set(from, { ...session, step: "menu" });
        await sendMenu(from, userName, session?.language || "en");
    }
}

/**
 * Format profile data into a readable message
 * Shows: Name, Location, Land Size, Language
 * Excludes: Current Crop, Sowing Date
 */
function formatProfileMessage(profile, language, userName) {
    const normalizedLang = normalizeLanguage(language);

    // Build location string
    const locationParts = [
        profile.village_name || "N/A",
        profile.district_name || "N/A",
        profile.state_name || "N/A"
    ].filter(part => part !== "N/A");
    const location = locationParts.join(", ");

    // Language names
    const langNames = {
        "en": "English",
        "hi": "हिंदी (Hindi)",
        "mr": "मराठी (Marathi)"
    };
    const langDisplay = langNames[normalizedLang] || "English";

    // Format land size
    const landSize = profile.land_size_hectares ? `${profile.land_size_hectares} hectares` : "N/A";

    // Build message based on language
    let message = "";

    if (normalizedLang === "hi") {
        message = `👤 *आपकी प्रोफाइल* 👤\n\n`;
        message += `📝 *नाम:* ${userName || "N/A"}\n`;
        message += `📍 *पता:* ${location}\n`;
        message += `🌾 *भूमि क्षेत्र:* ${landSize}\n`;
        message += `🗣️ *भाषा:* ${langDisplay}\n`;
    } else if (normalizedLang === "mr") {
        message = `👤 *आपले प्रोफाइल* 👤\n\n`;
        message += `📝 *नाव:* ${userName || "N/A"}\n`;
        message += `📍 *पता:* ${location}\n`;
        message += `🌾 *जमीन क्षेत्र:* ${landSize}\n`;
        message += `🗣️ *भाषा:* ${langDisplay}\n`;
    } else {
        // English
        message = `👤 *Your Profile* 👤\n\n`;
        message += `📝 *Name:* ${userName || "N/A"}\n`;
        message += `📍 *Address:* ${location}\n`;
        message += `🌾 *Land Area:* ${landSize}\n`;
        message += `🗣️ *Language:* ${langDisplay}\n`;
    }

    return message;
}

export default { handleProfileSelected };
