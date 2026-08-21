import db from "../config/db.js";

const findUserByPhone = async (phone_number) => {
    const result = await db.query(
        "SELECT * FROM user_schema.users WHERE phone_number = $1",
        [phone_number]
    );
    return result.rows[0];
};

const createUser = async (full_name, phone_number, user_type) => {
    const result = await db.query(
        `INSERT INTO user_schema.users (full_name, phone_number, user_type)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [full_name, phone_number, user_type]
    );
    return result.rows[0];
};

const updateUserVerified = async (userId) => {
    await db.query(
        `UPDATE user_schema.users SET is_verified = true, updated_at = NOW() WHERE id = $1`,
        [userId]
    );
};

// Update user language preference
const updateUserLanguage = async (userId, language) => {
    const result = await db.query(
        `UPDATE user_schema.users SET language = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [language, userId]
    );
    return result.rows[0];
};

// Update user location (latitude, longitude)
const updateUserLocation = async (userId, latitude, longitude) => {
    const result = await db.query(
        `UPDATE user_schema.users SET latitude = $1, longitude = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [latitude, longitude, userId]
    );
    return result.rows[0];
};

// Update user with onboarding data (language + location)
const updateUserOnboarding = async (userId, language, latitude, longitude) => {
    const result = await db.query(
        `UPDATE user_schema.users SET language = $1, latitude = $2, longitude = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
        [language, latitude, longitude, userId]
    );
    return result.rows[0];
};

// Get user by ID
const getUserById = async (userId) => {
    const result = await db.query(
        "SELECT * FROM user_schema.users WHERE id = $1",
        [userId]
    );
    return result.rows[0];
};

export { findUserByPhone, createUser, updateUserVerified, updateUserLanguage, updateUserLocation, updateUserOnboarding, getUserById };
