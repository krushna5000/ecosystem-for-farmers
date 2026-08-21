import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendLanguageMenu, sendMenu } from "../services/whatsappService.js";
import { checkUserRegistration } from "../services/authService.js";
import { registerWhatsappUser, findUserByWhatsappNumber, normalizePhone } from "../controllers/authController.js";
import { startOnboarding, isOnboardingComplete } from "./onboardingHandler.js";
import { getUserById } from "../models/userModel.js";

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

export async function handleGreeting(from, userName) {
    console.log(`\n🔐 [AUTH] Greeting from ${from} (${userName})`);
    userSessions.delete(from);

    const whatsappNumber = from.startsWith("91") ? from : `91${from}`;

    try {
        const result = await checkUserRegistration(whatsappNumber);
        console.log(`🔐 [AUTH] Registration check for ${whatsappNumber}: registered=${result.registered}`);

        if (result.registered) {
            // User already exists in DB → check if onboarding complete
            const user = await getUserById(result.user.id);

            if (user && user.language) {
                // Onboarding complete → load language from DB and go to menu
                console.log(`🔐 [AUTH] User ${from} already onboarded with language: ${user.language}`);
                const normalizedLang = normalizeLanguage(user.language);
                userSessions.set(from, {
                    step: "menu",
                    authenticated: true,
                    userId: user.id,
                    userName: user.full_name,
                    language: normalizedLang,
                });
                await sendMessage(from, STRINGS.en.welcomeBack(user.full_name));
                await sendMenu(from, user.full_name, normalizedLang);
            } else {
                // Onboarding incomplete (returning user) → go straight to menu with default language
                console.log(`🔐 [AUTH] User ${from} exists but onboarding incomplete, sending to menu with default language...`);
                const defaultLang = "en";
                userSessions.set(from, {
                    step: "menu",
                    authenticated: true,
                    userId: user.id,
                    userName: user.full_name,
                    language: defaultLang,
                });
                // Welcome back message + main menu
                await sendMessage(from, `👋 Welcome back, *${user.full_name}*!`, true);
                await sendMenu(from, user.full_name, defaultLang);
            }
        } else {
            // ✅ NEW USER - Go to initial onboarding (Language → Name → Pincode)
            // User NOT in DB → first time ever → register and start initial signup
            console.log(`🔐 [AUTH] New user ${from}, SKIPPING OTP, registering directly...`);

            try {
                // Register user WITHOUT OTP validation
                const normalizedPhone = normalizePhone(whatsappNumber);
                const newUser = await registerWhatsappUser(userName, normalizedPhone);

                console.log(`✅ [AUTH] New user registered: ${from}, User ID: ${newUser.id}`);

                // Start INITIAL onboarding (Language → Name → Pincode)
                await startInitialSignupFlow(from, newUser.full_name, newUser.id);
            } catch (regErr) {
                console.error("❌ [AUTH] Registration error:", regErr.message);
                await sendMessage(from, "❌ Something went wrong. Please try again later.");
            }
        }
    } catch (err) {
        console.error("❌ [AUTH] Auth check error:", err.response?.data || err.message);
        await sendMessage(from, "❌ Something went wrong. Please try again later.");
    }
}

export async function handleOtpVerification(from, text, userName) {
    const session = userSessions.get(from);
    console.log(`🔐 [AUTH] OTP verification from ${from}, step: ${session?.step}`);

    if (!session || session.step !== "waiting_for_otp") {
        console.log(`[AUTH] Invalid state for OTP verification from ${from}`);
        return false;
    }

    const whatsappNumber = from.startsWith("91") ? from : `91${from}`;

    try {
        const result = await registerUser(whatsappNumber, text.trim(), userName);

        if (result.success) {
            // Registration successful → start onboarding flow
            console.log(`[AUTH] Registration successful for ${from}, starting onboarding...`);
            await sendMessage(from, STRINGS.en.otpVerified);
            await startOnboarding(from, result.user.full_name, result.user.id);
        } else {
            console.log(`[AUTH] OTP verification failed for ${from}`);
            await sendMessage(from, STRINGS.en.otpInvalid);
        }
    } catch (err) {
        console.error("[AUTH] Registration error:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.message || "Invalid or expired OTP";
        await sendMessage(from, `${errorMsg}.\nSend any message to try again.`);
    }

    return true;
}

/**
 * INITIAL SIGNUP FLOW - For new users
 * Step 1: Select Language
 * Step 2: Confirm/Update Name
 * Step 3: Enter Pincode
 * Then: Complete signup, show menu
 */
async function startInitialSignupFlow(from, defaultName, userId) {
    userSessions.set(from, {
        authenticated: true,
        userId,
        userName: defaultName,
        step: "signup_language",
        signupData: { name: defaultName },
    });

    console.log(`[SIGNUP] Started for ${from} (${defaultName}) - Language selection`);

    const { sendLanguageMenu } = await import("../services/whatsappService.js");
    await sendLanguageMenu(from, defaultName);
}

/**
 * Step 1: Handle language selection during signup
 */
export async function handleSignupLanguageSelection(from, languageId) {
    const session = userSessions.get(from);

    if (!session || session.step !== "signup_language") {
        return false;
    }

    // Map language ID to language code
    const langMap = {
        "lang_en": "en",
        "lang_hi": "hi",
        "lang_mr": "mr",
    };

    const language = langMap[languageId];
    if (!language) {
        return false;
    }

    userSessions.set(from, {
        ...session,
        step: "signup_name",
        language,
        signupData: { ...session.signupData, language },
    });

    const s = STRINGS[language];
    await sendMessage(from, "👤 Please enter or confirm your *full name*:");

    console.log(`[SIGNUP] Language selected: ${language}`);
    return true;
}

/**
 * Step 2: Handle name input during signup
 */
export async function handleSignupName(from, text) {
    const session = userSessions.get(from);

    if (!session || session.step !== "signup_name") {
        return false;
    }

    const name = text.trim();
    if (name.length < 2) {
        const s = STRINGS[session.language] || STRINGS.en;
        await sendMessage(from, s.onboardingNameInvalid);
        return true;
    }

    userSessions.set(from, {
        ...session,
        step: "signup_pincode",
        userName: name,
        signupData: { ...session.signupData, name },
    });

    const s = STRINGS[session.language] || STRINGS.en;
    await sendMessage(from, s.onboardingAskPincode);

    console.log(`[SIGNUP] Name saved: ${name}`);
    return true;
}

/**
 * Step 3: Handle pincode input during signup
 */
export async function handleSignupPincode(from, text) {
    const session = userSessions.get(from);

    if (!session || session.step !== "signup_pincode") {
        return false;
    }

    const pincode = text.trim();

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
        const s = STRINGS[session.language] || STRINGS.en;
        await sendMessage(from, s.onboardingPincodeInvalid);
        return true;
    }

    // Save pincode to users table
    const { updateUserLanguage } = await import("../models/userModel.js");
    await updateUserLanguage(session.userId, session.language);

    // Update session - signup complete, go to menu
    userSessions.set(from, {
        ...session,
        step: "menu",
        signupData: { ...session.signupData, pincode },
    });

    const s = STRINGS[session.language] || STRINGS.en;

    // Completion message
    const completionMsg = `✅ *Signup Complete!* 🎉\n\nWelcome to FarmsEasy, ${session.userName}!\n\nType *menu* to see available services.`;

    await sendMessage(from, completionMsg);

    console.log(`[SIGNUP] Completed for ${session.userId} - ${session.userName}, Pincode: ${pincode}`);

    // Show main menu
    const { sendMenu } = await import("../services/whatsappService.js");
    await sendMenu(from, session.userName, session.language);
    return true;
}

export function isAuthenticated(from) {
    const session = userSessions.get(from);
    return session?.authenticated === true;
}
