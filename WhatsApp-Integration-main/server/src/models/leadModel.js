import db from "../config/db.js";

/**
 * Create a new lead in company_schema.leads
 * @param {Object} leadData 
 * @returns {Promise<Object>}
 */
export const createLead = async (leadData) => {
    const { userId, productId, phoneNumber, source = 'whatsapp', companyId = null, companyName = null } = leadData;
    
    const query = `
        INSERT INTO company_schema.leads (user_id, product_id, phone_number, source, status, company_id, company_name)
        VALUES ($1, $2, $3, $4, 'new', $5, $6)
        RETURNING *;
    `;
    
    const values = [userId, productId, phoneNumber, source, companyId, companyName];
    
    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error("❌ [DB] Error creating lead:", err.message);
        throw err;
    }
};

/**
 * Check if a lead already exists for this user and product in the last 24 hours
 */
export const checkExistingLead = async (phoneNumber, productId) => {
    const query = `
        SELECT id FROM company_schema.leads 
        WHERE phone_number = $1 AND product_id = $2 
        AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1;
    `;
    
    try {
        const result = await db.query(query, [phoneNumber, productId]);
        return result.rows.length > 0;
    } catch (err) {
        console.error("❌ [DB] Error checking existing lead:", err.message);
        return false;
    }
};

/**
 * Get product and company details by product ID
 */
export const getProductCompanyInfo = async (productId) => {
    const query = `
        SELECT company_id 
        FROM company_schema.products 
        WHERE id = $1;
    `;
    
    try {
        const result = await db.query(query, [productId]);
        return result.rows[0] || null;
    } catch (err) {
        console.error("❌ [DB] Error fetching product company info:", err.message);
        return null;
    }
};
