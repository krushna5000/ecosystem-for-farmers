import { getProductRecommendations } from "../utils/productRecommendations.js";

/**
 * Controller for product related operations
 */

export const getRecommendations = async (req, res) => {
    try {
        const { cropName, diseaseName, chemicalComposition } = req.query;

        console.log(`[API] Product recommendation request received:`, req.query);

        const recommendations = await getProductRecommendations(
            cropName,
            diseaseName,
            chemicalComposition
        );

        if (!recommendations.success) {
            return res.status(500).json(recommendations);
        }

        res.json(recommendations);
    } catch (error) {
        console.error(`[API] Product Recommendation Controller Error:`, error.message);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            details: error.message
        });
    }
};
