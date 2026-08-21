import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendMenu, sendStateList, sendDistrictList } from "../services/whatsappService.js";
import { getUserById, updateUserLocation } from "../models/userModel.js";
import {
    updateOnboardingRecord,
} from "../models/onboardingModel.js";

// Normalize language code
function normalizeLanguage(langValue) {
    if (!langValue) return "en";
    const langMap = {
        "en": "en", "english": "en", "English": "en",
        "hi": "hi", "hindi": "hi", "हिंदी": "hi", "हिंदी (Hindi)": "hi",
        "mr": "mr", "marathi": "mr", "मराठी": "mr", "मराठी (Marathi)": "mr",
    };
    return langMap[langValue] || "en";
}

function getStrings(from) {
    const session = userSessions.get(from);
    const normalizedLang = normalizeLanguage(session?.language);
    return STRINGS[normalizedLang];
}

/**
 * ONBOARDING FLOW - Triggered from Profile Menu (after signup)
 * Collects: State, District, Village, Land Size, Pincode, Location (Latitude/Longitude)
 * (Language, Name already collected during signup)
 * 
 * Step 1: State Selection
 * Step 2: District Selection
 * Step 3: Village Name Input
 * Step 4: Land Size Input
 * Step 5: Pincode Input
 * Step 6: Location (Latitude/Longitude)
 * Then: Complete & Show Menu
 */

/**
 * Start onboarding flow - triggered from Profile menu click
 * Skips language, name, pincode (already collected)
 * Goes directly to State Selection
 */
export async function startOnboarding(from, userName, userId, existingSession = null) {
    const session = existingSession || userSessions.get(from);
    const language = session?.language || "en";

    userSessions.set(from, {
        authenticated: true,
        userId,
        userName,
        language,
        step: "onboarding_state",
        onboardingData: {},
    });

    console.log(`[ONBOARDING] Started for ${from} (${userName}) - State selection with language: ${language}`);

    const s = getStrings(from);
    await sendMessage(from, s.onboardingAskState);
    await sendStateList(from, s);
}

/**
 * Step 1: Handle state selection
 * Saves state and asks for district selection
 */
export async function handleOnboardingStateSelection(from, selectedId) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_state") {
        return false;
    }

    const stateId = parseInt(selectedId);

    // Save state_id to database
    await updateOnboardingRecord(session.userId, {
        state_id: stateId,
    });

    userSessions.set(from, {
        ...session,
        step: "onboarding_district",
        onboardingData: { ...session.onboardingData, stateId },
    });

    const s = getStrings(from);
    await sendDistrictList(from, stateId, s);

    console.log(`[ONBOARDING] State selected: ${stateId}`);
    return true;
}

/**
 * Step 2: Handle district selection
 * Saves district and asks for village name
 */
export async function handleOnboardingDistrictSelection(from, selectedId) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_district") {
        return false;
    }

    const districtId = parseInt(selectedId);

    // Save district_id to database
    await updateOnboardingRecord(session.userId, {
        district_id: districtId,
    });

    userSessions.set(from, {
        ...session,
        step: "onboarding_village_name",
        onboardingData: { ...session.onboardingData, districtId },
    });

    const s = getStrings(from);
    await sendMessage(from, s.onboardingAskVillage);

    console.log(`[ONBOARDING] District selected: ${districtId}`);
    return true;
}

/**
 * Step 3: Handle village name text input
 * Saves village name and asks for land size
 */
export async function handleOnboardingVillageName(from, text) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_village_name") {
        return false;
    }

    const villageName = text.trim();
    if (villageName.length < 2) {
        const s = getStrings(from);
        await sendMessage(from, "❌ Please enter a valid village name (at least 2 characters).");
        return true;
    }

    // Save village_name to database
    await updateOnboardingRecord(session.userId, {
        village_name: villageName,
    });

    userSessions.set(from, {
        ...session,
        step: "onboarding_land_size",
        onboardingData: { ...session.onboardingData, villageName },
    });

    const s = getStrings(from);
    await sendMessage(from, s.onboardingAskLandSize);

    console.log(`[ONBOARDING] Village name saved: ${villageName}`);
    return true;
}

/**
 * Step 4: Handle land size input
 * Saves land size, asks for pincode
 */
export async function handleOnboardingLandSize(from, text) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_land_size") {
        return false;
    }

    const landSize = parseFloat(text.trim());
    if (isNaN(landSize) || landSize <= 0) {
        const s = getStrings(from);
        await sendMessage(from, s.onboardingLandSizeInvalid);
        return true;
    }

    // Save land size to database
    await updateOnboardingRecord(session.userId, {
        land_size_hectares: landSize,
    });

    // Update session to next step (pincode)
    userSessions.set(from, {
        ...session,
        step: "onboarding_pincode",
        onboardingData: { ...session.onboardingData, landSize },
    });

    const s = getStrings(from);
    await sendMessage(from, s.onboardingAskPincode);

    console.log(`[ONBOARDING] Land size saved: ${landSize} hectares`);
    return true;
}

/**
 * Step 5: Handle pincode input
 * Saves pincode, asks for location
 */
export async function handleOnboardingPincode(from, text) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_pincode") {
        return false;
    }

    const pincode = text.trim();

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
        const s = getStrings(from);
        await sendMessage(from, s.onboardingPincodeInvalid);
        return true;
    }

    // Save pincode to onboarding_data
    await updateOnboardingRecord(session.userId, {
        pincode: pincode,
    });

    // Update session to next step (location)
    userSessions.set(from, {
        ...session,
        step: "onboarding_location",
        onboardingData: { ...session.onboardingData, pincode },
    });

    const s = getStrings(from);
    await sendMessage(from, s.onboardingAskLocation);

    console.log(`[ONBOARDING] Pincode saved: ${pincode}`);
    return true;
}

/**
 * Step 6: Handle location input (latitude, longitude)
 * Saves location to users table, marks onboarding as completed
 */
export async function handleOnboardingLocation(from, latitude, longitude) {
    const session = userSessions.get(from);

    if (!session || session.step !== "onboarding_location") {
        return false;
    }

    // Validate location coordinates
    if (latitude === undefined || longitude === undefined) {
        const s = getStrings(from);
        await sendMessage(from, "❌ Invalid location. Please share your location again.");
        return true;
    }

    // Save location to users table
    await updateUserLocation(session.userId, latitude, longitude);

    // Mark onboarding as completed
    await updateOnboardingRecord(session.userId, {
        is_completed: true,
    });

    // Update session
    userSessions.set(from, {
        ...session,
        step: "menu",
        onboardingData: { ...session.onboardingData, latitude, longitude },
    });

    const s = getStrings(from);

    // Completion message
    const completionMsg = s.onboardingCompletionSimple
        .replace("{userName}", session.userName);

    await sendMessage(from, completionMsg);

    console.log(`[ONBOARDING] Completed for ${session.userId} - ${session.userName}, Location: (${latitude}, ${longitude})`);

    // Show main menu
    await sendMenu(from, session.userName, session.language);
    return true;
}

/**
 * Check if user has completed onboarding
 */
export async function isOnboardingComplete(userId) {
    try {
        const user = await getUserById(userId);
        return user && user.language && user.language !== null;
    } catch (err) {
        console.error("[ONBOARDING] Check error:", err.message);
        return false;
    }
}

/**
 * Check if user is in onboarding flow
 */
export function isInOnboardingFlow(session) {
    return session?.step?.startsWith("onboarding_");
}

export default {
    startOnboarding,
    handleOnboardingStateSelection,
    handleOnboardingDistrictSelection,
    handleOnboardingVillageName,
    handleOnboardingLandSize,
    handleOnboardingPincode,
    handleOnboardingLocation,
    isOnboardingComplete,
    isInOnboardingFlow,
};
