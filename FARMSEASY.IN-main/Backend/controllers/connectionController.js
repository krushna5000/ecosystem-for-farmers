import pool from "../config/db.js"

/* ===========================
   CREATE CONNECTION
=========================== */
export const createConnection = async (req, res) => {
  const { name, email, mobile, query } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO website_schema.connections 
       (name, email, mobile, query)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, mobile, query]
    );

    res.status(201).json({
      message: "Connection created successfully",
      connection: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ===========================
   GET ALL CONNECTIONS
=========================== */
export const getConnections = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM website_schema.connections ORDER BY connection_id DESC"
    );

    res.json({ connections: result.rows });
  } catch (err) {
    console.error("Error fetching connections:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ===========================
   GET SINGLE CONNECTION
=========================== */
export const getConnectionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM website_schema.connections WHERE connection_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json({ connection: result.rows[0] });
  } catch (err) {
    console.error("Error fetching connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ===========================
   UPDATE CONNECTION
=========================== */
/* ===========================
   UPDATE CONNECTION
=========================== */
export const updateConnection = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, query, status } = req.body; // include status

  try {
    // Check if connection exists
    const check = await pool.query(
      "SELECT * FROM website_schema.connections WHERE connection_id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Update only fields that are provided
    const updatedConnection = {
      name: name ?? check.rows[0].name,
      email: email ?? check.rows[0].email,
      mobile: mobile ?? check.rows[0].mobile,
      query: query ?? check.rows[0].query,
      status: status ?? check.rows[0].status,
    };

    await pool.query(
      `UPDATE website_schema.connections
       SET name = $1,
           email = $2,
           mobile = $3,
           query = $4,
           status = $5
       WHERE connection_id = $6`,
      [updatedConnection.name, updatedConnection.email, updatedConnection.mobile, updatedConnection.query, updatedConnection.status, id]
    );

    res.json({
      message: "Connection updated successfully",
      connection: updatedConnection,
    });
  } catch (err) {
    console.error("Error updating connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


/* ===========================
   DELETE CONNECTION
=========================== */
export const deleteConnection = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query(
      "SELECT * FROM website_schema.connections WHERE connection_id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Connection not found" });
    }

    await pool.query(
      "DELETE FROM website_schema.connections WHERE connection_id = $1",
      [id]
    );

    res.json({ message: "Connection deleted successfully" });
  } catch (err) {
    console.error("Error deleting connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//bulk delete

export const deleteMultipleConnections = async (req, res) => {
  try {
    const { ids } = req.body;

    // validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Connection IDs provided",
      });
    }

    // dynamic placeholders: $1, $2, $3...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `DELETE FROM website_schema.connections 
       WHERE connection_id IN (${placeholders})`,
      ids
    );

    // optional: handle case where nothing deleted
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No connections found for given IDs",
      });
    }

    res.json({
      success: true,
      deletedCount: result.rowCount,
      message: "Connections deleted successfully",
    });

  } catch (err) {
    console.error("BULK DELETE CONNECTIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};