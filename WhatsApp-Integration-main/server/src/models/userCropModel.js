import db from "../config/db.js";

// Add current crops for user (during onboarding)
const addUserCrop = async (user_id, crop_name) => {
    const result = await db.query(
        `INSERT INTO user_schema.user_current_crops (user_id, crop_name)
         VALUES ($1, $2)
         RETURNING *`,
        [user_id, crop_name]
    );
    return result.rows[0];
};

// Get all current crops for a user
const getUserCurrentCrops = async (user_id) => {
    const result = await db.query(
        `SELECT * FROM user_schema.user_current_crops WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id]
    );
    return result.rows;
};

// Delete a user's crop
const deleteUserCrop = async (crop_id) => {
    const result = await db.query(
        `DELETE FROM user_schema.user_current_crops WHERE id = $1 RETURNING *`,
        [crop_id]
    );
    return result.rows[0];
};

// Clear all crops for a user (for re-onboarding)
const clearUserCrops = async (user_id) => {
    await db.query(
        `DELETE FROM user_schema.user_current_crops WHERE user_id = $1`,
        [user_id]
    );
};

export { addUserCrop, getUserCurrentCrops, deleteUserCrop, clearUserCrops };
