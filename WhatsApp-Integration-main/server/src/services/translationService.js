import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("GEMINI_API_KEY missing");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const modelName = "gemini-2.5-flash";

// Retry helper for transient Gemini API errors
const callWithRetry = async (fn, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const status = err?.status || err?.httpStatusCode;
            if ((status === 503 || status === 429) && attempt < maxRetries) {
                const delay = 1000 * Math.pow(2, attempt);
                console.warn(`Gemini API ${status} — retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})`);
                await new Promise((r) => setTimeout(r, delay));
            } else {
                throw err;
            }
        }
    }
};

// Translate text to target language using Gemini
export const translateText = async (text, targetLanguage) => {
    // If target is English, no translation needed
    if (targetLanguage === "en") {
        return text;
    }

    const languageMap = {
        hi: "Hindi",
        mr: "Marathi",
    };

    const targetLang = languageMap[targetLanguage] || "English";

    try {
        const prompt = `You are a professional translator. Translate the following WhatsApp bot message to ${targetLang}.
Keep formatting intact (emojis, line breaks, asterisks for bold). Do NOT add any explanation.
Translate naturally as if a native speaker wrote it.

Original message:
${text}

Translated message:`;

        const response = await callWithRetry(() =>
            ai.models.generateContent({
                model: modelName,
                contents: prompt,
            })
        );

        return response.text.trim();
    } catch (err) {
        console.error(`Translation Error (${targetLanguage}):`, err.message);
        return text; // Fallback: return original text if translation fails
    }
};

// Translate multiple strings (batch optimization)
export const translateBatch = async (texts, targetLanguage) => {
    if (targetLanguage === "en" || !texts || texts.length === 0) {
        return texts;
    }

    const languageMap = {
        hi: "Hindi",
        mr: "Marathi",
    };

    const targetLang = languageMap[targetLanguage] || "English";

    try {
        const prompt = `You are a professional translator. Translate the following WhatsApp bot messages to ${targetLang}.
Keep formatting intact (emojis, line breaks, asterisks for bold).
For each message, provide ONLY the translation, numbered 1-${texts.length}.

Messages to translate:
${texts.map((t, i) => `${i + 1}. ${t}`).join("\n\n")}

Translations:`;

        const response = await callWithRetry(() =>
            ai.models.generateContent({
                model: modelName,
                contents: prompt,
            })
        );

        const translations = response.text.trim().split("\n\n");
        return translations.map((t) => t.replace(/^\d+\.\s*/, "").trim());
    } catch (err) {
        console.error(`Batch Translation Error (${targetLanguage}):`, err.message);
        return texts; // Fallback: return original texts if translation fails
    }
};
