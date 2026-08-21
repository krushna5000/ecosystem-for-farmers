import pool from '../config/db.js';

// Create a new crop stage
export const createCropStage = async (stage_name, description) => {
  try {
    const query = `
      INSERT INTO farms_schema.crop_stages (stage_name, description)
      VALUES ($1, $2) RETURNING *`;
    const values = [stage_name, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error creating crop stage: ${error.message}`);
  }
};

// Get all crop stages with pagination
export const getAllCropStages = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM farms_schema.crop_stages ORDER BY created_at ASC LIMIT $1 OFFSET $2`;
    const countQuery = `SELECT COUNT(*) FROM farms_schema.crop_stages`;
    
    const result = await pool.query(query, [limit, offset]);
    const countResult = await pool.query(countQuery);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error fetching crop stages: ${error.message}`);
  }
};

// Get crop stage by ID
export const getCropStageById = async (id) => {
  try {
    const query = `SELECT * FROM farms_schema.crop_stages WHERE id = $1`;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error fetching crop stage by ID: ${error.message}`);
  }
};

// Update crop stage by ID
export const updateCropStageById = async (id, stage_name, description) => {
  try {
    const query = `
      UPDATE farms_schema.crop_stages
      SET stage_name = $1, description = $2
      WHERE id = $3 RETURNING *`;
    const values = [stage_name, description, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error updating crop stage: ${error.message}`);
  }
};

// DELETE crop stage by ID (FIXED)
export const deleteCropStageById = async (id) => {
  try {
    await pool.query("BEGIN");

    // 1. REMOVE STAGE FROM CROPS JSON
    await pool.query(
      `
      UPDATE farms_schema.crops
      SET crop_stage_id = (
        SELECT jsonb_agg(e)
        FROM jsonb_array_elements(crop_stage_id) e
        WHERE (e->>'id')::int <> $1
      )
      WHERE crop_stage_id @> jsonb_build_array(
        jsonb_build_object('id', $1)
      );
      `,
      [id]
    );

    //  2. DELETE STAGE FROM MASTER TABLE
    const result = await pool.query(
      `DELETE FROM farms_schema.crop_stages WHERE id = $1`,
      [id]
    );

    await pool.query("COMMIT");

    //  return only status (not deleted data)
    return result.rowCount;

  } catch (error) {
    await pool.query("ROLLBACK");
    throw new Error(`Error deleting crop stage: ${error.message}`);
  }
};

// Bulk delete crop stages
export const bulkDeleteCropStages = async (ids) => {
  try {
    await pool.query("BEGIN");

    // 1. REMOVE STAGES FROM CROPS JSON
    for (const id of ids) {
      await pool.query(
        `
        UPDATE farms_schema.crops
        SET crop_stage_id = (
          SELECT jsonb_agg(e)
          FROM jsonb_array_elements(crop_stage_id) e
          WHERE (e->>'id')::int <> $1
        )
        WHERE crop_stage_id @> jsonb_build_array(
          jsonb_build_object('id', $1)
        );
        `,
        [id]
      );
    }

    // 2. DELETE STAGES FROM MASTER TABLE
    const result = await pool.query(
      `DELETE FROM farms_schema.crop_stages WHERE id = ANY($1) RETURNING id`,
      [ids]
    );

    await pool.query("COMMIT");

    return {
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(row => row.id)
    };

  } catch (error) {
    await pool.query("ROLLBACK");
    throw new Error(`Error bulk deleting crop stages: ${error.message}`);
  }
};
