import db from "../config/db.js";

// Create onboarding record
export const createOnboardingRecord = async (
    userId,
    userName = null,
    language = null,
    stateId = null,
    districtId = null,
    villageId = null,
    villageName = null,
    landSizeHectares = null,
    currentCropName = null,
    sowingDate = null,
    cropStageImageUrl = null,
    cropStage = null
) => {
    const result = await db.query(
        `INSERT INTO user_schema.onboarding_data 
        (user_id, user_name, language, state_id, district_id, village_id, village_name, land_size_hectares, current_crop_name, sowing_date, crop_stage_image_url, crop_stage, is_completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [userId, userName, language, stateId, districtId, villageId, villageName, landSizeHectares, currentCropName, sowingDate, cropStageImageUrl, cropStage, false]
    );
    return result.rows[0];
};

// Get onboarding record by user ID
export const getOnboardingRecord = async (userId) => {
    const result = await db.query(
        `SELECT od.*, 
                s.state_name, 
                d.district_name
        FROM user_schema.onboarding_data od
        LEFT JOIN location_schema.states s ON od.state_id = s.state_id
        LEFT JOIN location_schema.districts d ON od.district_id = d.district_id
        WHERE od.user_id = $1
        ORDER BY od.created_at DESC
        LIMIT 1`,
        [userId]
    );
    return result.rows[0];
};

// Update onboarding record (or create if not exists)
export const updateOnboardingRecord = async (userId, updateData) => {
    // First, check if record exists
    const checkResult = await db.query(
        `SELECT id FROM user_schema.onboarding_data WHERE user_id = $1`,
        [userId]
    );

    if (checkResult.rows.length === 0) {
        // Record doesn't exist - create a new one with the update data
        const insertData = { user_id: userId, is_completed: false, ...updateData };
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(insertData).forEach(([key, value]) => {
            fields.push(key);
            values.push(value);
            paramCount++;
        });

        const query = `INSERT INTO user_schema.onboarding_data (${fields.join(", ")})
                       VALUES (${fields.map((_, i) => `$${i + 1}`).join(", ")})
                       RETURNING *`;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    // Record exists - update it
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
    });

    fields.push(`updated_at = NOW()`);
    values.push(userId); // Add userId at the end

    const query = `UPDATE user_schema.onboarding_data 
                   SET ${fields.join(", ")}
                   WHERE user_id = $${paramCount}
                   RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
};

// Complete onboarding
export const completeOnboarding = async (userId) => {
    const result = await db.query(
        `UPDATE user_schema.onboarding_data 
        SET is_completed = true, updated_at = NOW()
        WHERE user_id = $1
        RETURNING *`,
        [userId]
    );
    return result.rows[0];
};

// Get all states
export const getAllStates = async () => {
    const result = await db.query(
        `SELECT state_id, state_name FROM location_schema.states ORDER BY state_name`
    );
    return result.rows;
};

// Get districts by state
export const getDistrictsByState = async (stateId) => {
    const result = await db.query(
        `SELECT district_id, district_name FROM location_schema.districts 
        WHERE state_id = $1 ORDER BY district_name`,
        [stateId]
    );
    return result.rows;
};

// Get villages by district
export const getVillagesByDistrict = async (districtId) => {
    const result = await db.query(
        `SELECT village_id, village_name FROM location_schema.villages 
        WHERE city_id IN (
            SELECT city_id FROM location_schema.cities WHERE district_id = $1
        )
        ORDER BY village_name
        LIMIT 20`,  // Limit to 20 for WhatsApp list display
        [districtId]
    );
    return result.rows;
};

export default {
    createOnboardingRecord,
    getOnboardingRecord,
    updateOnboardingRecord,
    completeOnboarding,
    getAllStates,
    getDistrictsByState,
    getVillagesByDistrict,
};
