import axios from "axios";
import { translateText } from "./translationService.js";
import { getSession, userSessions } from "../config/session.js";
import { getUserById } from "../models/userModel.js";

const WHATSAPP_API = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;

function getHeaders() {
    return {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
    };
}

/**
 * Get user's preferred language from session or database
 */
async function getUserLanguage(phoneNumber) {
    let session = userSessions.get(phoneNumber);
    
    // If not in cache, try fetching from DB
    if (!session) {
        session = await getSession(phoneNumber);
    }

    if (session?.language) {
        return session.language;
    }
    
    if (session?.userId) {
        try {
            const user = await getUserById(session.userId);
            return user?.language || "en";
        } catch (err) {
            console.error("User language fetch error:", err.message);
        }
    }
    return "en";
}

/**
 * Mark a message as read to show double blue ticks
 */
export async function markMessageAsRead(messageId) {
    try {
        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId
        }, {
            headers: getHeaders(),
        });
    } catch (err) {
        // Silently fail for read receipts as they aren't critical
        console.warn(`[WHATSAPP] Failed to mark message ${messageId} as read:`, err.message);
    }
}

/**
 * Send a message with automatic translation to user's preferred language
 * If language is not EN, the text will be translated through Gemini API
 */
export async function sendMessage(to, text, skipTranslation = false) {
    let messageText = text;

    if (!skipTranslation) {
        const userLang = await getUserLanguage(to);
        if (userLang !== "en") {
            messageText = await translateText(text, userLang);
        }
    }

    if (!messageText || messageText.trim() === "") {
        console.warn(`[WHATSAPP] Skipping empty message to ${to}`);
        return;
    }

    try {
        const response = await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: messageText },
        }, {
            headers: getHeaders(),
        });
        console.log(`[WHATSAPP] Text message sent to ${to}. ID: ${response.data.messages?.[0]?.id}`);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message;
        console.error(`❌ [WHATSAPP] Failed to send text message to ${to}:`, errorMsg);
        if (err.response?.data) {
            console.error(`[WHATSAPP] Error details:`, JSON.stringify(err.response.data, null, 2));
        }
        throw err;
    }
}

/**
 * Send an image message with caption and automatic translation
 */
export async function sendImageMessage(to, imageUrl, caption, skipTranslation = false) {
    let messageText = caption;

    if (!skipTranslation) {
        const userLang = await getUserLanguage(to);
        if (userLang !== "en") {
            messageText = await translateText(caption, userLang);
        }
    }

    if (!messageText || messageText.trim() === "") {
        console.warn(`[WHATSAPP] Skipping image message to ${to} due to empty caption`);
        return;
    }

    if (!imageUrl || imageUrl === 'NA') {
        console.warn(`[WHATSAPP] Falling back to text message for ${to} due to missing image URL`);
        await sendMessage(to, messageText, true); // Skip translation since it's already translated
        return;
    }

    try {
        const response = await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to,
            type: "image",
            image: {
                link: imageUrl,
                caption: messageText
            },
        }, {
            headers: getHeaders(),
        });
        console.log(`[WHATSAPP] Image message sent to ${to}. ID: ${response.data.messages?.[0]?.id}`);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message;
        console.error(`❌ [WHATSAPP] Failed to send image message to ${to}:`, errorMsg);
        if (err.response?.data) {
            console.error(`[WHATSAPP] Error details:`, JSON.stringify(err.response.data, null, 2));
        }
        // Fallback to text if image fails
        console.log(`[WHATSAPP] Attempting text fallback for ${to}...`);
        await sendMessage(to, messageText, true);
    }
}

/**
 * Send a product recommendation with an "Interested" button for lead generation
 */
/**
 * Send the AI Crop Report as an interactive message with a "Know More" button
 */
export async function sendInteractiveCropReport(to, reportText, lang = 'en') {
    try {
        const buttonMap = {
            en: "Know More ↗️",
            hi: "अधिक जानें ↗️",
            mr: "अधिक जाणून घ्या ↗️"
        };
        const headerMap = {
            en: "Crop Analysis",
            hi: "फसल विश्लेषण",
            mr: "पीक विश्लेषण"
        };

        const buttonText = buttonMap[lang] || buttonMap.en;
        const headerText = headerMap[lang] || headerMap.en;

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "text",
                    text: headerText
                },
                body: { text: reportText },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "know_more_crop",
                                title: buttonText
                            }
                        }
                    ]
                }
            }
        };

        const response = await axios.post(WHATSAPP_API, payload, { headers: getHeaders() });
        console.log(`[CROP] Interactive report sent to ${to}. ID: ${response.data.messages?.[0]?.id}`);
    } catch (err) {
        console.error(`❌ [CROP] Failed to send interactive report:`, err.response?.data || err.message);
        // Fallback to regular text if interactive fails
        await sendMessage(to, reportText);
    }
}

export async function sendProductLeadMessage(to, product, lang = 'en') {
    try {
        const title = `*${product.name}*`;
        const description = product.description;
        
        // Localized text for the lead generation prompt
        const footerMap = {
            en: "Are you interested in this product?",
            hi: "क्या आप इस उत्पाद में रुचि रखते हैं?",
            mr: "तुम्हाला या उत्पादनात रस आहे का?"
        };
        const buttonMap = {
            en: "I'm Interested",
            hi: "मुझे दिलचस्पी है",
            mr: "मी इच्छुक आहे"
        };

        const footerText = footerMap[lang] || footerMap.en;
        const buttonText = buttonMap[lang] || buttonMap.en;

        let translatedDesc = description;
        if (lang !== 'en') {
            translatedDesc = await translateText(description, lang);
        }

        const bodyText = `${translatedDesc}`;

        const interactive = {
            type: "button",
            body: { text: bodyText },
            footer: { text: footerText },
            action: {
                buttons: [
                    {
                        type: "reply",
                        reply: {
                            id: `lead_prod_${product.id}`,
                            title: buttonText
                        }
                    }
                ]
            }
        };

        // Add header based on image availability
        if (product.image && product.image !== 'NA' && product.image !== 'unknown') {
            interactive.header = {
                type: "image",
                image: { link: product.image }
            };
            // If we have an image, we can include the title in the body
            interactive.body.text = `*${product.name}*\n\n${translatedDesc}`;
        } else {
            interactive.header = {
                type: "text",
                text: product.name.substring(0, 60) // WhatsApp limit for header text
            };
        }

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: interactive
        };

        const response = await axios.post(WHATSAPP_API, payload, { headers: getHeaders() });
        console.log(`[LEAD] Product lead message sent to ${to}. ID: ${response.data.messages?.[0]?.id}`);
    } catch (err) {
        const errorMsg = err.response?.data?.error?.message || err.message;
        console.error(`❌ [LEAD] Failed to send lead message to ${to}:`, errorMsg);
        // Fallback to regular text if interactive fails
        const fallbackCaption = `*${product.name}*\n\n${product.description}`;
        await sendMessage(to, fallbackCaption);
    }
}

export async function sendLanguageMenu(to, userName) {
    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "FarmsEasy" },
            body: { text: `Hi ${userName}! Welcome to FarmsEasy Bot.\nPlease select your language / कृपया भाषा निवडा:` },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: "Select Language",
                sections: [
                    {
                        title: "Languages / भाषा",
                        rows: [
                            { id: "lang_en", title: "English", description: "Continue in English" },
                            { id: "lang_hi", title: "हिंदी (Hindi)", description: "हिंदी में जारी रखें" },
                            { id: "lang_mr", title: "मराठी (Marathi)", description: "मराठीत सुरू ठेवा" },
                        ],
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendHelpLanguageMenu(to, s) {
    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "Help / सहायता / मदत" },
            body: { text: s.helpSelectLang },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: s.helpSelectLangButton,
                sections: [
                    {
                        title: "Languages / भाषा",
                        rows: [
                            { id: "help_lang_en", title: "English", description: "Help in English" },
                            { id: "help_lang_hi", title: "हिंदी (Hindi)", description: "हिंदी में सहायता" },
                            { id: "help_lang_mr", title: "मराठी (Marathi)", description: "मराठीत मदत" },
                        ],
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendChangeLanguageMenu(to, s) {
    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "🌐 FarmsEasy" },
            body: { text: s.changeLangSelectPrompt },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: s.changeLangSelectButton,
                sections: [
                    {
                        title: "Languages / भाषा",
                        rows: [
                            { id: "lang_en", title: "English", description: "Continue in English" },
                            { id: "lang_hi", title: "हिंदी (Hindi)", description: "हिंदी में जारी रखें" },
                            { id: "lang_mr", title: "मराठी (Marathi)", description: "मराठीत सुरू ठेवा" },
                        ],
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendMenu(to, userName, lang) {
    const { STRINGS } = await import("../config/constants.js");
    const s = STRINGS[lang] || STRINGS.en;
    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: s.menuHeader },
            body: { text: s.menuBody(userName) },
            footer: { text: s.menuFooter },
            action: {
                button: s.menuButton,
                sections: [
                    {
                        title: s.servicesTitle,
                        rows: [
                            { id: "crop_ai", title: s.cropAiTitle, description: s.cropAiDesc },
                            { id: "profile", title: "👤 Profile", description: "View your profile" },
                            { id: "change_language", title: s.changeLanguageTitle, description: s.changeLanguageDesc },
                            { id: "help", title: s.helpTitle, description: s.helpDesc },

                            // ❌ COMMENTED OUT - Will be added later
                            // { id: "add_farm", title: s.addFarmTitle, description: s.addFarmDesc },
                            // { id: "my_farms", title: s.myFarmsTitle, description: s.myFarmsDesc },
                            // { id: "add_crop_main", title: s.mainAddCropTitle, description: s.mainAddCropDesc },
                            // { id: "crop_tracking_main", title: s.mainCropTrackingTitle, description: s.mainCropTrackingDesc },
                        ],
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendFarmList(to, farms, s) {
    // WhatsApp interactive list supports max 10 rows
    const farmRows = farms.slice(0, 10).map((farm) => ({
        id: `farm_detail_${farm.id}`,
        title: farm.farm_name.substring(0, 24), // WhatsApp title limit: 24 chars
        description: [farm.village_name, farm.district_name].filter(Boolean).join(", ").substring(0, 72) || "View details",
    }));

    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "FarmsEasy" },
            body: { text: `You have *${farms.length}* farm(s). Select one to view details:` },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: s.selectFarmButton,
                sections: [
                    {
                        title: s.selectFarmHeader,
                        rows: farmRows,
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendFarmActionMenu(to, farm, s) {
    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: s.farmActionHeader },
            body: { text: s.farmActionBody(farm.farm_name) },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: s.farmActionButton,
                sections: [
                    {
                        title: "Options",
                        rows: [
                            { id: `farm_info_${farm.id}`, title: s.farmActionInfoTitle, description: s.farmActionInfoDesc },
                            { id: `farm_add_crop_${farm.id}`, title: s.farmActionAddCropTitle, description: s.farmActionAddCropDesc },
                            { id: `farm_tracking_${farm.id}`, title: s.farmActionTrackingTitle, description: s.farmActionTrackingDesc },
                        ],
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

export async function sendFarmListForAction(to, farms, s, actionPrefix) {
    const farmRows = farms.slice(0, 10).map((farm) => ({
        id: `${actionPrefix}_farm_${farm.id}`,
        title: farm.farm_name.substring(0, 24),
        description: [farm.village_name, farm.district_name].filter(Boolean).join(", ").substring(0, 72) || "Select this farm",
    }));

    await axios.post(WHATSAPP_API, {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            header: { type: "text", text: "🌾 FarmsEasy" },
            body: { text: s.selectFarmForAction },
            footer: { text: "Powered by FarmsEasy" },
            action: {
                button: s.selectFarmActionButton,
                sections: [
                    {
                        title: s.selectFarmHeader,
                        rows: farmRows,
                    },
                ],
            },
        },
    }, {
        headers: getHeaders(),
    });
}

/**
 * Send state list for onboarding
 */
export async function sendStateList(to, s) {
    try {
        const { getAllStates } = await import("../models/onboardingModel.js");
        const states = await getAllStates();

        console.log(`[STATE_LIST] Fetched ${states.length} states`);

        if (states.length === 0) {
            await sendMessage(to, "❌ No states found. Please try again.");
            return;
        }

        const stateRows = states.slice(0, 10).map((state) => ({
            id: `onboarding_state_${state.state_id}`,
            title: state.state_name.substring(0, 24),
        }));

        console.log(`[STATE_LIST] Sending ${stateRows.length} state options`);

        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "📍 Select State" },
                body: { text: s.onboardingAskState },
                footer: { text: "FarmsEasy" },
                action: {
                    button: "Select",
                    sections: [
                        {
                            title: "States",
                            rows: stateRows,
                        },
                    ],
                },
            },
        }, {
            headers: getHeaders(),
        });

        console.log(`[STATE_LIST] Successfully sent state list to ${to}`);
    } catch (err) {
        const errorDetails = err.response?.data?.error?.message || err.message;
        console.error(`❌ [STATE_LIST] Error:`, errorDetails);
        if (err.response?.data) {
            console.error(`[STATE_LIST] Response data:`, JSON.stringify(err.response.data, null, 2));
        }
        await sendMessage(to, "❌ Failed to load states. Please try again.");
    }
}

/**
 * Send district list for onboarding
 */
export async function sendDistrictList(to, stateId, s) {
    try {
        const { getDistrictsByState } = await import("../models/onboardingModel.js");
        const districts = await getDistrictsByState(stateId);

        console.log(`[DISTRICT_LIST] Fetched ${districts.length} districts for state ${stateId}`);

        if (districts.length === 0) {
            await sendMessage(to, "❌ No districts found for this state. Please try again.");
            return;
        }

        const districtRows = districts.slice(0, 10).map((district) => ({
            id: `onboarding_district_${district.district_id}`,
            title: district.district_name.substring(0, 24),
        }));

        console.log(`[DISTRICT_LIST] Sending ${districtRows.length} district options`);

        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "📍 Select District" },
                body: { text: s.onboardingAskDistrict },
                footer: { text: "FarmsEasy" },
                action: {
                    button: "Select",
                    sections: [
                        {
                            title: "Districts",
                            rows: districtRows,
                        },
                    ],
                },
            },
        }, {
            headers: getHeaders(),
        });

        console.log(`[DISTRICT_LIST] Successfully sent district list to ${to}`);
    } catch (err) {
        const errorDetails = err.response?.data?.error?.message || err.message;
        console.error(`❌ [DISTRICT_LIST] Error:`, errorDetails);
        if (err.response?.data) {
            console.error(`[DISTRICT_LIST] Response data:`, JSON.stringify(err.response.data, null, 2));
        }
        await sendMessage(to, "❌ Failed to load districts. Please try again.");
    }
}

/**
 * Send village list for onboarding
 */
export async function sendVillageList(to, districtId, s) {
    try {
        const { getVillagesByDistrict } = await import("../models/onboardingModel.js");
        const villages = await getVillagesByDistrict(districtId);

        const villageRows = villages.slice(0, 50).map((village) => ({
            id: `onboarding_village_${village.village_id}`,
            title: village.village_name.substring(0, 24),
        }));

        await axios.post(WHATSAPP_API, {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "📍 Select Village" },
                body: { text: s.onboardingAskVillage },
                footer: { text: "FarmsEasy Onboarding" },
                action: {
                    button: "Select Village",
                    sections: [
                        {
                            title: "Villages",
                            rows: villageRows,
                        },
                    ],
                },
            },
        }, {
            headers: getHeaders(),
        });
    } catch (err) {
        console.error("Error sending village list:", err.message);
        await sendMessage(to, s.selectFromList);
    }
}
