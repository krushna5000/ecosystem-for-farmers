import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const modelName = "gemini-2.5-flash";

// Retry helper for transient Gemini API errors (503, 429, etc.)
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

// Detect user message intent (greeting, menu, or other) — supports any language
export const detectMessageIntent = async (text) => {
  try {
    const prompt = `You are a WhatsApp bot intent classifier. Classify the user's message into exactly ONE category.

Categories:
- GREETING: Any hello, hi, hey, good morning, namaste, namaskar, suprabhat, or similar greeting in ANY language
- MENU: Any request to see menu, services, options, help, or similar in ANY language  
- OTHER: Anything else including gibberish, random text, or unrelated messages

User message: "${text}"

Reply with ONLY one word: GREETING, MENU, or OTHER. No explanation.`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        generationConfig: { temperature: 0 }
      })
    );

    const result = response.text.trim().toUpperCase();
    if (result.includes("GREETING")) return "greeting";
    if (result.includes("MENU")) return "menu";
    return "other";
  } catch (err) {
    console.error("Intent Detection Error:", err.message);
    return "other"; // Safe fallback
  }
};

// Plant Validation
export const isPlantImage = async (imagePart) => {
  const prompt = `
Identify whether the image clearly shows a plant, crop, or leaf.

Rules:
- Answer ONLY with YES or NO
- If unclear or not a plant → answer NO
- Do not explain
`;

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: modelName,
      contents: [imagePart, prompt],
      generationConfig: { temperature: 0 }
    })
  );

  return response.text.trim().toUpperCase();
};

// Disease Analysis with Language Support
// language: 'en' (English), 'hi' (Hindi), 'mr' (Marathi)
export const analyzeCropDisease = async (imagePart, language = 'en') => {
  // Define language names for the prompt
  const languageMap = {
    'en': 'English',
    'hi': 'Hindi',
    'mr': 'Marathi'
  };
  const targetLanguage = languageMap[language] || 'English';

  const prompt = `
You are an expert Agricultural Scientist, Plant Pathologist, and Crop Advisor.

⚠️ CRITICAL INSTRUCTION: 
1. Perform your internal diagnostic analysis in ENGLISH to ensure scientific accuracy and consistency.
2. Generate the FINAL string values for the user in ${targetLanguage}.
3. The fields ending in "_en" MUST contain the precise technical English names (e.g., "Cotton", "Alternaria Leaf Spot", "Propiconazole"). These fields are used to search our internal database, so accuracy is mandatory.
4. Ensure the diagnosis is CONSISTENT regardless of which language the farmer selects.

Analyze the uploaded image of a crop / plant / tree / leaf captured by a farmer in real field conditions.

You MUST follow these rules strictly:
- Output ONLY valid JSON
- Do NOT include markdown, explanations, or extra text
- Do NOT wrap JSON in code blocks
- If any value is uncertain, use "unknown" instead of guessing
- Use simple farmer-understandable wording where possible

Return the response in the EXACT JSON structure below. Fields ending with "_en" MUST always be in English, while other string values should be in ${targetLanguage}:

{
  "cropIdentification": {
    "cropName": "string in ${targetLanguage}",
    "cropName_en": "Standard English Crop Name (e.g., 'Cotton', 'Tomato', 'Wheat')",
    "growthStage": "string",
    "confidenceLevel": "high | moderate | low | unknown"
  },

  "visibleSymptoms": {
    "severity": "low | moderate | high | critical",
    "symptoms": ["string"],
    "affectedParts": ["leaf | stem | fruit | flower | root | whole plant"]
  },

  "diagnosis": {
    "primaryIssue": {
      "name": "string in ${targetLanguage}",
      "name_en": "Standard English Disease/Pest Name (e.g., 'Alternaria Leaf Spot', 'Aphids')",
      "type": "fungal | bacterial | viral | pest | nutrient deficiency | physiological | unknown",
      "scientificName": "string | unknown",
      "confidence": "high | moderate | low"
    },
    "secondaryPossibilities": [
      {
        "name": "string",
        "reason": "string"
      }
    ]
  },

  "currentHealthStatus": {
    "overallStatus": "healthy | mild stress | severe stress | crop at risk",
    "impact": {
      "photosynthesis": "low | moderate | high impact",
      "growth": "low | moderate | high impact",
      "yieldRisk": "low | medium | high"
    },
    "riskIfUntreated": "string"
  },

  "rootCauseAnalysis": {
    "weatherFactors": ["string"],
    "soilFactors": ["string"],
    "farmingPracticeFactors": ["string"],
    "diseaseSpreadFactors": ["string"]
  },

  "treatmentPlan": {
    "chemicalTreatment": [
      {
        "productName": "string",
        "activeIngredient": "string",
        "activeIngredient_en": "Standard Technical English Name of Active Ingredient (e.g., 'Propiconazole', 'Azoxystrobin')",
        "chemicalComposition": "string",
        "dosage": "string",
        "applicationMethod": "foliar spray | soil drench | seed treatment",
        "modeOfAction": "string",
        "preHarvestIntervalDays": "number | unknown",
        "safetyPrecautions": ["string"]
      }
    ],
    "organicAlternatives": [
      {
        "name": "string",
        "usage": "string"
      }
    ]
  },

  "preventiveMeasures": {
    "irrigation": ["string"],
    "cropManagement": ["string"],
    "nutrition": ["string"],
    "monitoringTips": ["string"]
  },

  "farmerActionPlan": {
    "today": ["string"],
    "thisWeek": ["string"],
    "nextSeason": ["string"]
  }
}

Remember:
- Base all conclusions strictly on visible symptoms and agricultural science
- Do NOT assume region unless specified
- Farmer safety and clarity are highest priority
- Generate response text values in ${targetLanguage}, but ensure "_en" fields are scientifically accurate English terms for database lookup.
- All field names in JSON remain in English.
`;

  console.log(`[AI PROMPT] Language set to: ${targetLanguage} - Response will be generated directly in this language`);

  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: modelName,
      contents: [imagePart, prompt],
      generationConfig: {
        temperature: 0,
        topP: 0.1,
      }
    })
  );

  let text = response.text.trim();
  console.log(`[GEMINI API] RAW RESPONSE (first 500 chars):\n${text.substring(0, 500)}`);
  console.log(`[GEMINI API] Total response length: ${text.length} characters`);

  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const cleanedText = text.trim();

  console.log(`[GEMINI API] CLEANED RESPONSE (first 500 chars):\n${cleanedText.substring(0, 500)}`);
  console.log(`[GEMINI API] Trying to parse JSON...`);

  return cleanedText;
};
