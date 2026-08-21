import { fileToGenerativePart } from "../utils/fileHelper.js";
import { isPlantImage, analyzeCropDisease } from "../services/geminiService.js";
import { normalizeImage } from "../utils/normalizeImage.js";
import { getProductRecommendations } from "../utils/productRecommendations.js";
import { getFileHash, getCachedAnalysis, cacheAnalysis } from "../services/cacheService.js";

// Analyze crop image — core logic from WebApp controllers/whatsapp/cropController.js
export const analyzeWhatsappCrop = async (imagePath, language = "en") => {
    try {
        // 1. Calculate image hash for caching
        const imageHash = await getFileHash(imagePath);
        console.log(`[ANALYSIS] Image Hash: ${imageHash.substring(0, 8)}...`);

        // 2. Check Redis cache for existing analysis (specific to language)
        const cacheKey = `analysis:${imageHash}:${language}`;
        const cachedReport = await getCachedAnalysis(cacheKey);

        let parsedReport;

        if (cachedReport) {
            console.log(`[ANALYSIS] Cache HIT ✅ skipping AI calls.`);
            parsedReport = cachedReport;
        } else {
            console.log(`[ANALYSIS] Cache MISS ❌ calling Gemini...`);
            // Normalize language code
            const normalizedLanguage = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : 'en';

            const normalizedPath = await normalizeImage(imagePath);
            const imagePart = fileToGenerativePart(normalizedPath, "image/jpeg");

            const isPlant = await isPlantImage(imagePart);

            if (!isPlant.includes("YES")) {
                // Clean up normalized image
                const fs = await import("fs");
                fs.default.unlink(normalizedPath, () => { });
                throw new Error("This is not a plant/crop image");
            }

            const reportText = await analyzeCropDisease(imagePart, language);

            // Clean up normalized image
            const fs = await import("fs");
            fs.default.unlink(normalizedPath, () => { });

            try {
                parsedReport = JSON.parse(reportText);
                console.log(`[AI ANALYSIS] JSON parsing SUCCESS ✅`);
                
                // 3. Save to Redis cache (expire in 7 days)
                await cacheAnalysis(cacheKey, parsedReport);
            } catch (parseErr) {
                console.error(`[AI ANALYSIS] JSON parse error:`, parseErr.message);
                throw new Error("AI analysis failed - invalid JSON response");
            }
        }

        // Fetch product recommendations
        let productRecommendations = null;
        try {
            // Use English names for database search if available, fallback to regional names
            const searchCrop = parsedReport?.cropIdentification?.cropName_en || parsedReport?.cropIdentification?.cropName;
            const searchDisease = parsedReport?.diagnosis?.primaryIssue?.name_en || parsedReport?.diagnosis?.primaryIssue?.name;
            const searchChemical =
                parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.activeIngredient_en ||
                parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.activeIngredient ||
                parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.chemicalComposition;

            console.log(`[RECOMMENDATION] Search Terms: Crop=${searchCrop}, Disease=${searchDisease}, Chemical=${searchChemical}`);

            if (searchCrop || searchDisease) {
                productRecommendations = await getProductRecommendations(
                    searchCrop || "",
                    searchDisease || "",
                    searchChemical || ""
                );
            }
        } catch (error) {
            console.error("[AI ANALYSIS] Product Recommendations Error:", error.message);
            productRecommendations = { success: false, products: [] };
        }

        // Log completion with key findings
        const cropName = parsedReport?.cropIdentification?.cropName || "Unknown";
        const diseaseName = parsedReport?.diagnosis?.primaryIssue?.name || "Unknown";
     //   console.log(`[AI ANALYSIS] Complete - Crop: ${cropName}, Disease: ${diseaseName}`);

        return {
            status: "success",
            report: parsedReport,
            productRecommendations,
        };
    } catch (error) {
        console.error(`[AI ANALYSIS] ERROR:`, error.message);
        throw error;
    }
};
