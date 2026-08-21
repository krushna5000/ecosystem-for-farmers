import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const modelName = "gemini-3-flash-preview";
// const modelName = "gemini-2.5-flash";

// Plant Validation
export const isPlantImage = async (imagePart) => {
  const prompt = `
Identify whether the image clearly shows a plant, crop, or leaf.

Rules:
- Answer ONLY with YES or NO
- If unclear or not a plant → answer NO
- Do not explain
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [imagePart, prompt],
  });

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

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [imagePart, prompt],
  });

  return response.text.trim();
};
