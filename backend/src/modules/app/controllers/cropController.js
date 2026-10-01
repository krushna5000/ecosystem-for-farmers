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
  const user_id = Number(req.user.id);
  const { language = "en" } = req.body;

  if (!req.imageBuffer) {
    return res.status(400).json({
      status: "error",
      message: "कृपया पिकाचा फोटो अपलोड करा!",
    });
  }

  try {
    const buffer = req.imageBuffer;
    const normalizedBuffer = await normalizeImage(buffer);
    const imageHash = getImageHash(normalizedBuffer);

    const existingDiagnosis = await CropDiagnosis.findOne({
      user_id,
      imageHash,
    });

    if (existingDiagnosis) {
      let cachedReport = existingDiagnosis.diagnosisData;

      let productRecommendations = null;
      try {
        const cropName = cachedReport?.cropIdentification?.cropName;
        const diseaseName = cachedReport?.diagnosis?.primaryIssue?.name;
        const chemicalTreatment = cachedReport?.treatmentPlan?.chemicalTreatment?.[0];
        const chemicalComposition = chemicalTreatment?.activeIngredient
          || chemicalTreatment?.chemicalComposition
          || chemicalTreatment?.productName;

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
        productRecommendations: productRecommendations,
        imageUrl: existingDiagnosis.imageUrl,
        cached: true,
      });
    }

    const imagePart = fileToGenerativePart(normalizedBuffer, "image/jpeg");

    const isPlant = await isPlantImage(imagePart);

    if (!isPlant.includes("YES")) {
      return res.status(400).json({
        status: "error",
        message: "हा फोटो पिकाचा किंवा वनस्पतीचा नाही",
      });
    }

    const s3ImageUrl = await uploadImageToS3({ buffer: normalizedBuffer, imageHash });

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

    let productRecommendations = null;
    try {
      const cropName = parsedReport?.cropIdentification?.cropName;
      const diseaseName = parsedReport?.diagnosis?.primaryIssue?.name;
      const chemicalComposition = parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.activeIngredient || parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.chemicalComposition;

      if (cropName || diseaseName) {
        productRecommendations = await getProductRecommendations(
          cropName || "",
          diseaseName || "",
          chemicalComposition || ""
        );
      }
    } catch (error) {
      console.error("Product Recommendations Error:", error);
      productRecommendations = {
        success: false,
        error: "Failed to fetch product recommendations",
        products: []
      };
    }

    let responseReport = parsedReport;

    if (language !== "en") {
      responseReport = await translateResponse(parsedReport, language);
    }

    return res.json({
      status: "success",
      report: responseReport,
      productRecommendations: productRecommendations,
      sourceLanguage: "en",
      responseLanguage: language,
      imageUrl: s3ImageUrl,
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

