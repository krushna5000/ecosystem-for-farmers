import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY missing — Gemini-backed routes will not work.");
}

const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-3-flash-preview";

const langMap = {
  hi: "Hindi",
  mr: "Marathi",
};

export const translateResponse = async (jsonData, targetLang) => {
  const prompt = `
You are a translation engine.

Translate the following JSON from English to ${langMap[targetLang]}.

STRICT RULES (DO NOT BREAK):
- Output ONLY valid raw JSON
- DO NOT use markdown
- DO NOT wrap in \`\`\`
- DO NOT add explanations or comments
- Preserve JSON structure exactly
- Do NOT change keys
- Do NOT add or remove fields
- Use farmer-friendly language for values only

JSON INPUT:
${JSON.stringify(jsonData)}
`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return JSON.parse(response.text);
};
