import 'dotenv/config';
import axios from 'axios';

const COMPANY_BACKEND_URL = process.env.COMPANY_BACKEND_URL || 'http://localhost:5000';

/**
 * Fetch product recommendations from Company Backend
 * @param {string} cropName - Name of the crop detected by Gemini
 * @param {string} diseaseName - Name of the disease detected by Gemini
 * @param {string} chemicalComposition - Recommended chemical from Gemini
 * @returns {Promise<Object>} - Product recommendations
 */
export const getProductRecommendations = async (cropName, diseaseName, chemicalComposition) => {
  try {
    // Validate inputs - at least cropName or diseaseName is required
    // OLD: if (!cropName || !diseaseName || !chemicalComposition)
    if (!cropName && !diseaseName) {
      throw new Error('At least cropName or diseaseName is required');
    }

    // Build params - only include non-empty values
    const params = {};
    if (cropName?.trim()) params.cropName = cropName.trim();
    if (diseaseName?.trim()) params.diseaseName = diseaseName.trim();
    if (chemicalComposition?.trim()) params.chemicalComposition = chemicalComposition.trim();

    // Call Company Backend API
    const response = await axios.get(
      `${COMPANY_BACKEND_URL}/api/company/products/recommendation`,
      {
        params,
        timeout: 10000 // 10 second timeout
      }
    );

    // Return product data
    return {
      success: true,
      count: response.data.count || 0,
      products: response.data.data || [],
      breakdown: response.data.breakdown || null
    };

  } catch (error) {
    console.error('Product Recommendation Error:', error.message);

    // Handle different error scenarios
    if (error.response) {
      // Company backend returned error
      return {
        success: false,
        error: error.response.data.message || 'Failed to fetch products',
        products: []
      };
    } else if (error.request) {
      // No response from company backend
      return {
        success: false,
        error: 'Company backend is not responding',
        products: []
      };
    } else {
      // Other errors
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }
};