import db from "../config/db.js";

/**
 * Fetch product recommendations from Local Database (company_schema.products)
 * Hybrid approach:
 * 1. Match by disease_names array (Exact/Partial)
 * 2. Match by chemical_composition jsonb (Active Ingredient)
 * 3. Fallback to keyword search in name/description
 * 
 * @param {string} cropName - Name of the crop detected by Gemini
 * @param {string} diseaseName - Name of the disease detected by Gemini
 * @param {string} chemicalComposition - Recommended chemical from Gemini
 * @returns {Promise<Object>} - Product recommendations
 */
export const getProductRecommendations = async (cropName, diseaseName, chemicalComposition) => {
    try {
        console.log(`[RECOMMENDATION] Searching for: Crop=${cropName}, Disease=${diseaseName}, Chemical=${chemicalComposition}`);

        if (!cropName && !diseaseName && !chemicalComposition) {
            return { success: true, count: 0, products: [], message: "Insufficient data for recommendation" };
        }

        // Clean inputs
        const cleanCrop = cropName?.trim() || "";
        const cleanDisease = diseaseName?.trim() || "";
        const cleanChemical = chemicalComposition?.trim() || "";

        // Hybrid Search Query
        // We use a ranking system to prioritize matches
        // Improved: added word-based fuzzy matching
        const query = `
            WITH RankedProducts AS (
                SELECT 
                    id, 
                    product_name, 
                    description, 
                    chemical_composition, 
                    image, 
                    disease_names,
                    (
                        CASE 
                            -- Priority 1: Exact disease match in array
                            WHEN $1 <> '' AND $1 = ANY(disease_names) THEN 100
                            
                            -- Priority 2: Partial disease match in array (Sub-string)
                            WHEN $1 <> '' AND EXISTS (SELECT 1 FROM unnest(disease_names) AS d WHERE d ILIKE '%' || $1 || '%') THEN 80
                            
                            -- Priority 3: Word-based match for disease (Handles partial terms like 'Deficiency' vs 'Potassium Deficiency')
                            WHEN $1 <> '' AND EXISTS (
                                SELECT 1 FROM unnest(disease_names) AS d 
                                WHERE EXISTS (
                                    SELECT 1 FROM unnest(string_to_array($1, ' ')) AS word 
                                    WHERE length(word) > 3 AND d ILIKE '%' || word || '%'
                                )
                            ) THEN 70

                            -- Priority 4: Chemical composition match
                            WHEN $2 <> '' AND jsonb_typeof(chemical_composition) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(chemical_composition) AS c WHERE c->>'name' ILIKE '%' || $2 || '%') THEN 60
                            
                            -- Priority 5: Disease name in product description/name
                            WHEN $1 <> '' AND (product_name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%') THEN 50
                            
                            -- Priority 6: Word-based fallback in name/description
                            WHEN $1 <> '' AND EXISTS (
                                SELECT 1 FROM unnest(string_to_array($1, ' ')) AS word 
                                WHERE length(word) > 3 AND (product_name ILIKE '%' || word || '%' OR description ILIKE '%' || word || '%')
                            ) THEN 30

                            -- Priority 7: Crop name in description/name (Fallback)
                            WHEN $3 <> '' AND (product_name ILIKE '%' || $3 || '%' OR description ILIKE '%' || $3 || '%') THEN 20
                            
                            ELSE 0
                        END
                    ) as match_score
                FROM company_schema.products
                WHERE status = true
            )
            SELECT * FROM RankedProducts
            WHERE match_score > 0
            ORDER BY match_score DESC, product_name ASC
            LIMIT 5;
        `;

        const result = await db.query(query, [cleanDisease, cleanChemical, cleanCrop]);

        // Transform data to match previous API structure
        const products = result.rows.map(row => ({
            id: row.id,
            name: row.product_name,
            description: row.description,
            image: row.image,
            chemicalComposition: row.chemical_composition,
            matchScore: row.match_score
        }));

        console.log(`[RECOMMENDATION] Found ${products.length} products locally.`);

        return {
            success: true,
            count: products.length,
            products: products,
            source: 'local_db'
        };

    } catch (error) {
        console.error("Local Product Recommendation Error:", error.message);
        return {
            success: false,
            error: "Failed to fetch recommendations locally",
            products: [],
            details: error.message
        };
    }
};
