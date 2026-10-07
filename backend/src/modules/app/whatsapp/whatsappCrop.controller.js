import { fileToGenerativePart } from "../../../utils/app/fileHelper.js";
import { isPlantImage, analyzeCropDisease } from "../cropAi/gemini.service.js";
import { normalizeImage } from "../../../utils/app/normalizeImage.js";
import { getProductRecommendations } from "../../../utils/app/productRecommendations.js";

const analyzeWhatsappCrop = async (req, res) => {
  const { language = "en" } = req.body;

  if (!req.imageBuffer) {
    return res.status(400).json({ status: "error", message: "Please upload a crop image" });
  }

  try {
    const normalizedBuffer = await normalizeImage(req.imageBuffer);
    const imagePart = fileToGenerativePart(normalizedBuffer, "image/jpeg");

    const isPlant = await isPlantImage(imagePart);
    if (!isPlant.includes("YES")) {
      return res.status(400).json({ status: "error", message: "This is not a plant/crop image" });
    }

    const reportText = await analyzeCropDisease(imagePart);

    let parsedReport;
    try {
      parsedReport = JSON.parse(reportText);
    } catch {
      return res.status(422).json({ status: "error", message: "AI analysis failed" });
    }

    let productRecommendations = null;
    try {
      const cropName = parsedReport?.cropIdentification?.cropName;
      const diseaseName = parsedReport?.diagnosis?.primaryIssue?.name;
      const chemicalComposition =
        parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.activeIngredient ||
        parsedReport?.treatmentPlan?.chemicalTreatment?.[0]?.chemicalComposition;

      if (cropName || diseaseName) {
        productRecommendations = await getProductRecommendations(
          cropName || "",
          diseaseName || "",
          chemicalComposition || ""
        );
      }
    } catch (error) {
      console.error("Product Recommendations Error:", error.message);
      productRecommendations = { success: false, products: [] };
    }

    return res.json({
      status: "success",
      report: parsedReport,
      productRecommendations,
    });
  } catch (error) {
    console.error("WhatsApp Crop Controller Error:", error);
    return res.status(500).json({ status: "error", message: "Analysis failed, please try again" });
  }
};

export default analyzeWhatsappCrop;

