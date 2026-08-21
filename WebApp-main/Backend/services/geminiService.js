import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
// const modelName = "gemini-3-flash-preview";
const modelName = "gemini-2.5-flash";

// Retry helper for transient Gemini API errors (503, 429, etc.)
const callWithRetry = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status || err?.httpStatusCode;
      if ((status === 503 || status === 429) && attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
        console.warn(`Gemini API ${status} — retrying in ${delay / 1000}s (attempt ${attempt}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
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

  // OLD: Direct call (replaced with retry logic for 503/429 errors)
  // const response = await ai.models.generateContent({
  //   model: modelName,
  //   contents: [imagePart, prompt],
  // });

  // NEW: Retry-wrapped call
  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: modelName,
      contents: [imagePart, prompt],
    })
  );

  return response.text.trim().toUpperCase();
};

// Disease Analysis
export const analyzeCropDisease = async (imagePart) => {
  const prompt = `
You are an expert Agricultural Scientist, Plant Pathologist, and Crop Advisor.

Analyze the uploaded image of a crop / plant / tree / leaf captured by a farmer in real field conditions.

You MUST follow these rules strictly:
- Output ONLY valid JSON
- Do NOT include markdown, explanations, or extra text
- Do NOT wrap JSON in code blocks
- If any value is uncertain, use "unknown" instead of guessing
- Use simple farmer-understandable wording where possible

Return the response in the EXACT JSON structure below:

{
  "cropIdentification": {
    "cropName": "string",
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
      "name": "string",
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
`;

  // OLD: Direct call (replaced with retry logic for 503/429 errors)
  // const response = await ai.models.generateContent({
  //   model: modelName,
  //   contents: [imagePart, prompt],
  // });

  // NEW: Retry-wrapped call
  const response = await callWithRetry(() =>
    ai.models.generateContent({
      model: modelName,
      contents: [imagePart, prompt],
    })
  );

  // OLD: return response.text.trim();
  // NEW: Strip markdown code block wrappers (```json ... ```) that Gemini sometimes adds
  let text = response.text.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return text.trim();
};
