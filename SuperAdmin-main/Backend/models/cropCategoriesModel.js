import pool from '../config/db.js';

/**
 * Create a new crop category
 * @param {string} categoryName 
 * @param {string} description 
 * @returns {Object} 
 */
export const createCategory = async (categoryName, description) => {
  const query = `
    INSERT INTO farms_schema.crop_categories (category_name, description)
    VALUES ($1, $2)
    RETURNING *
  `;
  const values = [categoryName, description];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get all crop categories with pagination
 * @param {number} page 
 * @param {number} limit 
 * @returns {Object} 
 */
export const getAllCategories = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = 'SELECT * FROM farms_schema.crop_categories ORDER BY created_at ASC LIMIT $1 OFFSET $2';
  const countQuery = 'SELECT COUNT(*) FROM farms_schema.crop_categories';
  
  const result = await pool.query(query, [limit, offset]);
  const countResult = await pool.query(countQuery);
  
  return {
    data: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
};

/**
 * Get a crop category by ID
 * @param {number} id 
 * @returns {Object|null} 
 */
export const getCategoryById = async (id) => {
  const query = 'SELECT * FROM farms_schema.crop_categories WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update a crop category
 * @param {number} id 
 * @param {string} categoryName 
 * @param {string} description 
 * @returns {Object|null} 
 */
export const updateCategory = async (id, categoryName, description) => {
  const query = `
    UPDATE farms_schema.crop_categories
    SET category_name = $1, description = $2
    WHERE id = $3
    RETURNING *
  `;
  const values = [categoryName, description, id];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Delete a crop category
 * @param {number} id 
 * @returns {Object|null} 
 */
export const deleteCategory = async (id) => {
  const query = 'DELETE FROM farms_schema.crop_categories WHERE id = $1 RETURNING *';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Bulk delete crop categories
 * @param {Array} ids 
 * @returns {Object} 
 */
export const bulkDeleteCategories = async (ids) => {
  const query = 'DELETE FROM farms_schema.crop_categories WHERE id = ANY($1) RETURNING id';
  const result = await pool.query(query, [ids]);
  return {
    deletedCount: result.rowCount,
    deletedIds: result.rows.map(row => row.id)
  };
};
