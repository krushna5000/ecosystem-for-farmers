import { userSessions } from "../config/session.js";
import { sendMessage, sendChangeLanguageMenu, sendMenu } from "../services/whatsappService.js";
import { updateUserLanguage } from "../models/userModel.js";
import { STRINGS } from "../config/constants.js";

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
 * Handle Change Language selection from main menu
 * Shows language options and allows user to select their preferred language
 */
export async function handleChangeLanguageSelected(from, session, userName) {
    try {
        console.log(` [LANGUAGE] User ${from} selected change language`);

        const s = getStrings(from);

        // Show language selection menu
        await sendChangeLanguageMenu(from, s);

        // Update session to wait for language selection
        userSessions.set(from, { ...session, step: "select_new_language" });

    } catch (error) {
        console.error(`❌ [LANGUAGE] Error:`, error.message);
        const s = getStrings(from);
        await sendMessage(from, "❌ Error changing language. Please try again.");
        userSessions.set(from, { ...session, step: "menu" });
        await sendMenu(from, userName, session?.language || "en");
    }
}

/**
 * Handle language selection from the menu
 * Updates user's language preference in database and session
 */
export async function handleLanguageChangeConfirmed(from, selectedLangId, session, userName) {
    try {
        console.log(`🌐 [LANGUAGE] User ${from} confirmed language change: ${selectedLangId}`);

        const langMap = {
            "lang_en": "en",
            "lang_hi": "hi",
            "lang_mr": "mr",
        };

        const newLang = langMap[selectedLangId] || "en";

        // Update in session immediately
        userSessions.set(from, {
            ...session,
            language: newLang,
            step: "menu"
        });

        // Update in database if user is authenticated
        if (session?.userId) {
            try {
                await updateUserLanguage(session.userId, newLang);
                console.log(`✅ [LANGUAGE] Updated language in DB for user ${from}: ${newLang}`);
            } catch (dbError) {
                console.warn(`⚠️ [LANGUAGE] Could not update DB, but session updated:`, dbError.message);
            }
        }

        // Get new language strings
        const newStrings = STRINGS[newLang] || STRINGS.en;
        const langNames = {
            "en": "English",
            "hi": "हिंदी (Hindi)",
            "mr": "मराठी (Marathi)"
        };

        // Send confirmation message in new language
        let confirmMessage = "";
        if (newLang === "hi") {
            confirmMessage = `✅ भाषा हिंदी में बदल गई!`;
        } else if (newLang === "mr") {
            confirmMessage = `✅ भाषा मराठीत बदलली!`;
        } else {
            confirmMessage = `✅ Language changed to English!`;
        }

        await sendMessage(from, confirmMessage);

        // Send menu in new language
        await sendMenu(from, userName, newLang);

    } catch (error) {
        console.error(`❌ [LANGUAGE] Error confirming language change:`, error.message);
        const s = getStrings(from);
        await sendMessage(from, "❌ Error updating language. Please try again.");
        userSessions.set(from, { ...session, step: "menu" });
        await sendMenu(from, userName, session?.language || "en");
    }
}

export default { handleChangeLanguageSelected, handleLanguageChangeConfirmed };
