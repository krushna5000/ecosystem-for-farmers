import { findRecommendations } from "../../modules/company/recommendation/recommendation.service.js";

/**
 * Product recommendations for a Gemini crop-disease diagnosis.
 * The company catalogue lives in this same backend, so this is a direct call
 * (previously an HTTP request to the separate Company backend).
 *
 * @param {string} cropName - Name of the crop detected by Gemini
 * @param {string} diseaseName - Name of the disease detected by Gemini
 * @param {string} chemicalComposition - Recommended chemical from Gemini
 * @returns {Promise<{success: boolean, count?: number, products: object[], breakdown?: object, error?: string}>}
 */
export const getProductRecommendations = async (cropName, diseaseName, chemicalComposition) => {
  try {
    // at least cropName or diseaseName is required
    if (!cropName && !diseaseName) {
      throw new Error("At least cropName or diseaseName is required");
    }

    const { breakdown, data } = await findRecommendations({
      cropName: cropName?.trim() || undefined,
      diseaseName: diseaseName?.trim() || undefined,
      chemicalComposition: chemicalComposition?.trim() || undefined,
    });

    return {
      success: true,
      count: data.length,
      products: data,
      breakdown: breakdown || null,
    };
  } catch (error) {
    console.error("Product Recommendation Error:", error.message);
    return { success: false, error: error.message, products: [] };
  }
};
