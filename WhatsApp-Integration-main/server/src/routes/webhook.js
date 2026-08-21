import express from "express";
import { LANGUAGES, STRINGS } from "../config/constants.js";
import { userSessions, processedMessages, getSession } from "../config/session.js";
import { sendMessage, sendMenu, sendLanguageMenu, sendFarmListForAction, sendHelpLanguageMenu } from "../services/whatsappService.js";
import { handleGreeting, handleOtpVerification, handleSignupLanguageSelection, handleSignupName, handleSignupPincode, isAuthenticated } from "../handlers/authHandler.js";
import { handleOnboardingStateSelection, handleOnboardingDistrictSelection, handleOnboardingVillageName, handleOnboardingLandSize, handleOnboardingPincode, handleOnboardingLocation, isInOnboardingFlow } from "../handlers/onboardingHandler.js";
import { handleCropAiSelected, handleCropImage } from "../handlers/cropHandler.js";
import { handleAddFarmSelected, handleFarmStep, isInFarmFlow } from "../handlers/farmHandler.js";
import { handleMyFarmsSelected, handleFarmSelected, handleFarmInfoSelected } from "../handlers/myFarmHandler.js";
import { handleAddCropSelected, handleCropSelected, handleSowingDateInput, isInCropManagementFlow } from "../handlers/cropManagementHandler.js";
import { handleCropTrackingSelected, handleTrackingCropSelected } from "../handlers/clsmHandler.js";
import { detectMessageIntent } from "../services/geminiService.js";
import { getUserIdByPhone } from "../controllers/farmController.js";
import { getFarmsByUser } from "../models/farmModel.js";

const router = express.Router();

// Common greetings in supported languages (fast matching, no API call needed)
const GREETING_WORDS = new Set([
    "hi", "hello", "hey", "hii", "hiii", "helo",
    "good morning", "good afternoon", "good evening",
    "नमस्ते", "नमस्कार", "सुप्रभात", "हैलो", "हाय", "हेलो",
    "नमस्कार", "सुप्रभात", "हॅलो", "हाय",
    "shubh prabhat", "namaskar", "namaste", "suprabhat",
]);

// Common menu keywords in supported languages
const MENU_WORDS = new Set([
    "menu", "memu", "मेनू", "मेन्यू", "सेवाएं", "सेवा",
    "services", "help", "options", "सेवा पहा", "सहाय्य", "मदद",
]);

// Normalize language code (handle both 'en' and 'English' formats)
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

// Check if text is a known greeting
function isGreeting(text) {
    return GREETING_WORDS.has(text);
}

// Check if text is a known menu command
function isMenuCommand(text) {
    return MENU_WORDS.has(text);
}

// Helper: Show farm list for main menu Add Crop / Crop Tracking
async function handleMainMenuFarmSelect(from, session, actionPrefix) {
    const s = getStrings(from);
    const whatsappNumber = from.startsWith("91") ? from : `91${from}`;

    try {
        const user = await getUserIdByPhone(whatsappNumber);
        if (!user) {
            await handleGreeting(from, userName);
            return;
        }

        const farms = await getFarmsByUser(user.id);

        if (!farms || farms.length === 0) {
            await sendMessage(from, s.noFarms);
            userSessions.set(from, { ...session, step: "menu" });
            return;
        }

        userSessions.set(from, { ...session, step: `select_farm_for_${actionPrefix}`, farms });
        await sendFarmListForAction(from, farms, s, actionPrefix);
    } catch (err) {
        console.error("Farm Select Error:", err.message);
        await sendMessage(from, "Failed to fetch your farms. Please try again.\n\nType *menu* to go back.");
        userSessions.set(from, { ...session, step: "menu" });
    }
}

// Webhook verification (GET)
router.get("/", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receive messages (POST)
router.post("/", async (req, res) => {
    res.sendStatus(200);

    try {
        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0]?.value;
        const message = change?.messages?.[0];

        if (!message) return;

        const msgId = message.id;
        if (processedMessages.has(msgId)) return;
        processedMessages.add(msgId);
        setTimeout(() => processedMessages.delete(msgId), 5 * 60 * 1000);

        const from = message.from;
        const userName = change.contacts?.[0]?.profile?.name || "there";
        const msgType = message.type;
        const session = await getSession(from);

        console.log(`Message from ${userName} (${from}) [${msgType}] session:`, session);

        // ── Text message ──
        if (msgType === "text") {
            const text = message.text?.body?.trim().toLowerCase();

            // ❌ OTP STEP SKIPPED FOR NOW ❌
            // if (session?.step === "waiting_for_otp") {
            //     await handleOtpVerification(from, message.text?.body?.trim(), userName);
            // }

            // INITIAL SIGNUP FLOW (New Users)
            // 1. Signup name input
            if (session?.step === "signup_name") {
                await handleSignupName(from, message.text?.body?.trim());
            }
            // 2. Signup pincode input
            else if (session?.step === "signup_pincode") {
                await handleSignupPincode(from, text);
            }
            // PROFILE ONBOARDING FLOW (Returning Users - collect location data)
            // 3. Onboarding village name input
            else if (session?.step === "onboarding_village_name") {
                await handleOnboardingVillageName(from, message.text?.body?.trim());
            }
            // 4. Onboarding land size input
            else if (session?.step === "onboarding_land_size") {
                await handleOnboardingLandSize(from, text);
            }
            // 5. Onboarding pincode input
            else if (session?.step === "onboarding_pincode") {
                await handleOnboardingPincode(from, text);
            }
            // 6. Active farm flow steps
            else if (isInFarmFlow(from)) {
                await handleFarmStep(from, message, userName);
            }
            // 8. Active crop management flow
            else if (isInCropManagementFlow(from)) {
                await handleSowingDateInput(from, message);
            }
            // 9. Waiting for image but got text
            else if (session?.step === "waiting_for_image") {
                const s = getStrings(from);
                // Don't show menu, just remind them to send photo
                await sendMessage(from, s.sendPhoto, true); // Skip translation for consistency
            }
            // 10. NOT authenticated → ANY text triggers greeting
            else if (!isAuthenticated(from)) {
                await handleGreeting(from, userName);
            }
            // ── Below: user IS authenticated ──
            // 11. Known greeting words → re-greet
            else if (isGreeting(text)) {
                await handleGreeting(from, userName);
            }
            // 12. Known menu command → show menu
            else if (isMenuCommand(text)) {
                if (session?.language) {
                    userSessions.set(from, { ...session, step: "menu", farmData: undefined });
                    const normalizedLang = normalizeLanguage(session.language);
                    await sendMenu(from, userName, normalizedLang);
                } else {
                    await sendLanguageMenu(from, userName);
                }
            }
            // 13. Any other text from authenticated user → show service menu
            //    (no more "I didn't understand" — smooth UX)
            else {
                if (session?.language) {
                    userSessions.set(from, { ...session, step: "menu", farmData: undefined });
                    const normalizedLang = normalizeLanguage(session.language);
                    await sendMenu(from, userName, normalizedLang);
                } else {
                    await sendLanguageMenu(from, userName);
                }
            }
        }

        // ── Interactive list reply ──
        else if (msgType === "interactive") {
            const selectedId = message.interactive?.list_reply?.id || message.interactive?.button_reply?.id;

            // Auth guard: if not authenticated, auto-trigger greeting flow
            if (!isAuthenticated(from)) {
                await handleGreeting(from, userName);
                return;
            }

            // Onboarding state selection
            if (session?.step === "onboarding_state" && selectedId?.startsWith("onboarding_state_")) {
                const stateId = selectedId.replace("onboarding_state_", "");
                await handleOnboardingStateSelection(from, stateId);
            }
            // Onboarding district selection
            else if (session?.step === "onboarding_district" && selectedId?.startsWith("onboarding_district_")) {
                const districtId = selectedId.replace("onboarding_district_", "");
                await handleOnboardingDistrictSelection(from, districtId);
            }
            // Language selection (can be for signup, profile onboarding, or change language)
            else if (LANGUAGES[selectedId] || selectedId?.startsWith("lang_")) {
                // Initial signup language selection
                if (session?.step === "signup_language") {
                    await handleSignupLanguageSelection(from, selectedId);
                }
                // Change language from menu
                else if (session?.step === "select_new_language") {
                    const { handleLanguageChangeConfirmed } = await import("../handlers/languageHandler.js");
                    await handleLanguageChangeConfirmed(from, selectedId, session, userName);
                }
                // Regular language selection (menu)
                else if (LANGUAGES[selectedId]) {
                    const lang = LANGUAGES[selectedId].code;
                    userSessions.set(from, { ...session, language: lang, step: "menu" });
                    await sendMenu(from, userName, lang);
                }
            }
            // Crop AI selected
            else if (selectedId === "crop_ai") {
                await handleCropAiSelected(from, session);
            }
            // Profile selected → Show user profile
            else if (selectedId === "profile") {
                const { handleProfileSelected } = await import("../handlers/profileHandler.js");
                await handleProfileSelected(from, session, userName);
            }
            // Change Language selected → Show language options
            else if (selectedId === "change_language") {
                const { handleChangeLanguageSelected } = await import("../handlers/languageHandler.js");
                await handleChangeLanguageSelected(from, session, userName);
            }
            // Product Lead Interest
            else if (selectedId?.startsWith("lead_prod_")) {
                const { handleProductInterest } = await import("../handlers/leadHandler.js");
                await handleProductInterest(from, selectedId, session);
            }
            // Know More Crop Link
            else if (selectedId === "know_more_crop") {
                const linkText = session?.language === 'mr' ? "संपूर्ण अहवाल पाहण्यासाठी येथे क्लिक करा: https://zeocrop.farmseasy.in/" :
                                 session?.language === 'hi' ? "पूरा विवरण देखने के लिए यहां क्लिक करें: https://zeocrop.farmseasy.in/" :
                                 "Click here to view the full report: https://zeocrop.farmseasy.in/";
                await sendMessage(from, linkText);

                // Automatically show Main Menu after sending the link
                await new Promise(resolve => setTimeout(resolve, 1500));
                const { sendMenu } = await import("../services/whatsappService.js");
                await sendMenu(from, session?.userName || "there", session?.language || "en");
            }
            // Add Farm selected → Coming Soon
            else if (selectedId === "add_farm") {
                await sendMessage(from, "[ADD FARM] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // My Farms selected → Coming Soon
            else if (selectedId === "my_farms") {
                await sendMessage(from, "[MY FARMS] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Farm detail selected (from My Farms list) → Coming Soon
            else if (selectedId?.startsWith("farm_detail_")) {
                await sendMessage(from, "[FEATURE] This feature is coming soon!\n\nWe're working hard to bring this to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Sub-Menu: Farm Information → Coming Soon
            else if (selectedId?.startsWith("farm_info_")) {
                await sendMessage(from, "[FARM INFORMATION] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Sub-Menu: Add Crop → Coming Soon
            else if (selectedId?.startsWith("farm_add_crop_")) {
                await sendMessage(from, "[ADD CROP] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Sub-Menu: Crop Tracking → Coming Soon
            else if (selectedId?.startsWith("farm_tracking_")) {
                await sendMessage(from, "[CROP TRACKING] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Add Crop Flow: Select Crop → Coming Soon
            else if (selectedId?.startsWith("crop_select_")) {
                await sendMessage(from, "[ADD CROP] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Tracking Flow: Select Crop → Coming Soon
            else if (selectedId?.startsWith("tracking_crop_")) {
                await sendMessage(from, "[CROP TRACKING] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Main Menu: Add Crop (step 1 — show farms list) → Coming Soon
            else if (selectedId === "add_crop_main") {
                await sendMessage(from, "[ADD CROP] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Main Menu: Crop Tracking (step 1 — show farms list) → Coming Soon
            else if (selectedId === "crop_tracking_main") {
                await sendMessage(from, "[CROP TRACKING] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Main Menu Add Crop: Farm selected (step 2 → go to crop selection) → Coming Soon
            else if (selectedId?.startsWith("addcrop_farm_")) {
                await sendMessage(from, "[ADD CROP] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Main Menu Crop Tracking: Farm selected (step 2 → go to crop tracking) → Coming Soon
            else if (selectedId?.startsWith("tracking_farm_")) {
                await sendMessage(from, "[CROP TRACKING] Feature is coming soon!\n\nWe're working hard to bring this feature to you. Stay tuned!");
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            }
            // Help selected → show in user's saved language (no need to select language again)
            else if (selectedId === "help") {
                console.log(`[HELP] User language from session: ${session?.language}`);
                const normalizedLang = normalizeLanguage(session?.language || "en");
                console.log(`[HELP] Normalized language: ${normalizedLang}`);
                const helpStrings = STRINGS[normalizedLang] || STRINGS.en;
                console.log(`[HELP] Help text length: ${helpStrings?.helpText?.length || 'UNDEFINED'}`);

                if (helpStrings?.helpText) {
                    await sendMessage(from, helpStrings.helpText);
                    console.log(`[HELP] Help text sent successfully`);
                } else {
                    console.error(`[HELP] ERROR: Help text not found for language: ${normalizedLang}`);
                    await sendMessage(from, "Error loading help. Please try again.");
                }

                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, normalizedLang);
            }
        }

        // ── Location message (for farm flow or onboarding) ──
        else if (msgType === "location") {
            if (!isAuthenticated(from)) {
                await handleGreeting(from, userName);
                return;
            }
            // Onboarding location flow
            if (session?.step === "onboarding_location") {
                const latitude = message.location?.latitude;
                const longitude = message.location?.longitude;
                await handleOnboardingLocation(from, latitude, longitude);
            }
            // Farm registration location flow
            else if (isInFarmFlow(from)) {
                await handleFarmStep(from, message, userName);
            }
        }

        // ── Image message ──
        else if (msgType === "image") {
            if (!isAuthenticated(from)) {
                await handleGreeting(from, userName);
                return;
            }
            // Handle crop image analysis
            await handleCropImage(from, message, userName);
        }

        // ── Video message ──
        else if (msgType === "video") {
            if (!isAuthenticated(from)) {
                await handleGreeting(from, userName);
                return;
            }

            const s = getStrings(from);
            // Video not supported for crop analysis
            if (session?.step === "waiting_for_image") {
                const videoUnsupportedMsg = s.videoNotSupported || "Videos are not supported for crop analysis. Please send a *photo* of your crop instead.";
                await sendMessage(from, videoUnsupportedMsg);
                // Reset to menu
                userSessions.set(from, { ...session, step: "menu" });
                await sendMenu(from, userName, session.language || "en");
            } else {
                // Video sent in other contexts
                await sendMessage(from, "Videos are not supported. Please try another action or type *menu* to see options.");
            }
        }

    } catch (err) {
        console.error("Webhook Error:", err.response?.data || err.message);
    }
});

export default router;
