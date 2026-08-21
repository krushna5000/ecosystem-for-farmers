import fs from "fs";
import { fileToGenerativePart } from "../utils/fileHelper.js";
import { isPlantImage, analyzeCropDisease } from "../services/geminiService.js";
import { normalizeImage } from "../utils/normalizeImage.js";
import { storeCropDiagnosis } from "../mongoControllers/diagnosisController.js";
import { translateResponse } from "../utils/translateResponse.js";
import { getImageHash } from "../utils/getImageHash.js";
import CropDiagnosis from "../mongoModels/CropDiagnosis.js";
import uploadImageToS3 from "../services/s3Upload.js";
import { getProductRecommendations } from "../utils/productRecommendations.js";

const analyzeCrop = async (req, res) => {
  const { user_id, language = "en" } = req.body;

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "कृपया पिकाचा फोटो अपलोड करा!",
    });
  }

  try {
    const originalPath = req.file.path;

    // 1) Normalize image (format + size)
    const normalizedPath = await normalizeImage(originalPath);

    const imageHash = getImageHash(normalizedPath);

    // Check DB first
    const existingDiagnosis = await CropDiagnosis.findOne({
      user_id: user_id,
      imageHash,
    });

    if (existingDiagnosis) {
      let cachedReport = existingDiagnosis.diagnosisData;

      // ✅ NEW: Fetch product recommendations for cached diagnosis too
      let productRecommendations = null;
      try {
        const cropName = cachedReport?.cropIdentification?.cropName;
        const diseaseName = cachedReport?.diagnosis?.primaryIssue?.name;
        const chemicalTreatment = cachedReport?.treatmentPlan?.chemicalTreatment?.[0];
        const chemicalComposition = chemicalTreatment?.activeIngredient
          || chemicalTreatment?.chemicalComposition
          || chemicalTreatment?.productName;

        // OLD: if (cropName && diseaseName && chemicalComposition)
        // NEW: Fetch even without chemicalComposition (disease-only or crop-only match)
        if (cropName || diseaseName) {
          productRecommendations = await getProductRecommendations(
            cropName || "",
            diseaseName || "",
            chemicalComposition || ""
          );
        }
      } catch (error) {
        console.error("Product Recommendations Error (cached):", error.message);
        productRecommendations = {
          success: false,
          error: "Failed to fetch product recommendations",
          products: []
        };
      }

      if (language !== "en") {
        cachedReport = await translateResponse(cachedReport, language);
      }

      return res.json({
        status: "success",
        report: cachedReport,
        productRecommendations: productRecommendations, // ✅ NEW: Added product recommendations
        cached: true,
      });
    }

    // 2) Create Gemini image part FROM NORMALIZED IMAGE
    const imagePart = fileToGenerativePart(normalizedPath, "image/jpeg");

    // 3) Plant validation (hardened)
    const isPlant = await isPlantImage(imagePart);

    // 4) isPlant then store to S3 and DB with hash, else return error
    const s3ImageUrl = await uploadImageToS3({ filePath: normalizedPath, imageHash });

    if (!isPlant.includes("YES")) {
      return res.status(400).json({
        status: "error",
        message: "हा फोटो पिकाचा किंवा वनस्पतीचा नाही",
      });
    }

    // 4) Disease analysis
    const reportText = await analyzeCropDisease(imagePart);

    let parsedReport;
    try {
      parsedReport = JSON.parse(reportText);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr.message);
      return res.status(422).json({
        status: "error",
        message: "AI विश्लेषण अयशस्वी झाले!",
      });
    }

    await storeCropDiagnosis(user_id, parsedReport, imageHash, s3ImageUrl);

    // ✅ NEW: Fetch product recommendations
    let productRecommendations = null;
    try {
      const cropName = parsedReport?.cropIdentification?.cropName;
      const diseaseName = parsedReport?.diagnosis?.primaryIssue?.name;
      const chemicalComposition = parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.activeIngredient || parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.chemicalComposition;

      // OLD: if (cropName && diseaseName && chemicalComposition)
      // NEW: Fetch even without chemicalComposition (disease-only or crop-only match)
      if (cropName || diseaseName) {
        productRecommendations = await getProductRecommendations(
          cropName || "",
          diseaseName || "",
          chemicalComposition || ""
        );
      }
    } catch (error) {
      console.error("Product Recommendations Error:", error);
      // Don't break the flow if product fetch fails
      productRecommendations = {
        success: false,
        error: "Failed to fetch product recommendations",
        products: []
      };
    }

    // TRANSLATE FOR RESPONSE (if needed)
    let responseReport = parsedReport;

    if (language !== "en") {
      responseReport = await translateResponse(parsedReport, language);
    }

    // 5) SUCCESS RESPONSE
    return res.json({
      status: "success",
      report: responseReport,
      productRecommendations: productRecommendations, // ✅ NEW: Added product recommendations
      sourceLanguage: "en",
      responseLanguage: language,
      imagePath: normalizedPath,
      imageUrl: normalizedPath,
      cached: false,
    });

  } catch (error) {
    console.error("Crop Controller Error:", error);
    return res.status(500).json({
      status: "error",
      message: "तांत्रिक अडचण आली आहे, कृपया पुन्हा प्रयत्न करा",
    });
  }
};

export default analyzeCrop;
