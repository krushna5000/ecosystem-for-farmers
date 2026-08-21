import pool from "../config/db.js";


export const checkEmailExists = async (email) => {
  try {
    // Query across all schemas
    const query = `
      SELECT 'superadmin' AS source FROM public.super_admins WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'admin' FROM admins_schema.admins WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'vendor' FROM vendor_schema.vendors WHERE LOWER(email) = LOWER($1)
      UNION ALL
      SELECT 'company' FROM company_schema.companies WHERE LOWER(email) = LOWER($1)
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      return {
        exists: true,
        foundIn: result.rows[0].source
      };
    }

    return {
      exists: false,
      foundIn: null
    };

  } catch (error) {
    console.error("checkEmailExists error:", error.message);
    // In case of error, return false to not block operations
    // but log the error for debugging
    return {
      exists: false,
      foundIn: null,
      error: error.message
    };
  }
};

