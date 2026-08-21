import pool from "../config/db.js";

// Create Service Location
export const createServiceLocation = async (req, res) => {
  try {
    const { vendor_id, state, city, pincode, is_serviceable } = req.body;

    if (!vendor_id || !state || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID, State, City, and Pincode are required"
      });
    }

    // Check Duplicate (optional but recommended)
    const exists = await pool.query(
      `SELECT * FROM vendor_schema.service_locations 
       WHERE vendor_id = $1 AND state = $2 AND city = $3 AND pincode = $4`,
      [vendor_id, state, city, pincode]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Service location already exists for this vendor"
      });
    }

    const result = await pool.query(
      `INSERT INTO vendor_schema.service_locations 
      (vendor_id, state, city, pincode, is_serviceable) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [vendor_id, state, city, pincode, is_serviceable ?? true]
    );

    res.status(201).json({
      success: true,
      message: "Service location created successfully",
      serviceLocation: result.rows[0]
    });

  } catch (error) {
    console.error("Create Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error creating service location" });
  }
};

// Get all locations for vendor
export const getServiceLocations = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM vendor_schema.service_locations 
       WHERE vendor_id = $1 ORDER BY created_at DESC`,
      [vendor_id]
    );

    res.status(200).json({ success: true, serviceLocations: result.rows });
  } catch (error) {
    console.error("Get Service Locations Error:", error);
    res.status(500).json({ success: false, message: "Error fetching service locations" });
  }
};

// Get one location by ID
export const getServiceLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM vendor_schema.service_locations WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service location not found"
      });
    }

    res.status(200).json({ success: true, serviceLocation: result.rows[0] });

  } catch (error) {
    console.error("Get Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error fetching service location" });
  }
};

// Update location
export const updateServiceLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, city, pincode, is_serviceable } = req.body;

    const result = await pool.query(
      `UPDATE vendor_schema.service_locations 
       SET state = $1, city = $2, pincode = $3, is_serviceable = $4, updated_at = NOW() 
       WHERE id = $5 RETURNING *`,
      [state, city, pincode, is_serviceable, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service location not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service location updated successfully",
      serviceLocation: result.rows[0]
    });

  } catch (error) {
    console.error("Update Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error updating service location" });
  }
};

// Delete location
export const deleteServiceLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM vendor_schema.service_locations 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Service location not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service location deleted successfully"
    });

  } catch (error) {
    console.error("Delete Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error deleting service location" });
  }
};
