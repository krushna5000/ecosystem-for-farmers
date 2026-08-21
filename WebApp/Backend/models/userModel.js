import db from '../config/db.js';

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

const updateUserProfile = async (userId, fullName, language) => {
  const result = await db.query(
    `UPDATE user_schema.users 
     SET full_name = COALESCE($1, full_name), 
         language = COALESCE($2, language), 
         updated_at = NOW() 
     WHERE id = $3 
     RETURNING id, phone_number, full_name, language, created_at, updated_at`,
    [fullName, language, userId]
  );
  return result.rows[0];
};

const getUserById = async (userId) => {
  const result = await db.query(
    "SELECT id, phone_number, full_name, language, created_at, updated_at FROM user_schema.users WHERE id = $1",
    [userId]
  );
  return result.rows[0];
};

export { findUserByPhone, createUser, updateUserVerified, updateUserProfile, getUserById };
