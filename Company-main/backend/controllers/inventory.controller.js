import pool from "../config/db.js";
import { success, failure } from "../utils/response.js";

//  CREATE INVENTORY 
export const createInventory = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const company_id = req.company.id;  // ✔ your middleware sets req.company

    if (!product_id) return failure(res, "product_id is required");
    if (quantity == null) return failure(res, "quantity is required");

    const product = await pool.query(
      `SELECT id FROM company_schema.products
       WHERE id = $1 AND company_id = $2`,
      [product_id, company_id]
    );

    if (product.rows.length === 0)
      return failure(res, "Product not found for this company");

    const exists = await pool.query(
      `SELECT id FROM company_schema.inventory
       WHERE product_id = $1 AND company_id = $2`,
      [product_id, company_id]
    );

    if (exists.rows.length > 0)
      return failure(res, "Inventory already exists for this product");

    const stock_status = quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

    const result = await pool.query(
      `INSERT INTO company_schema.inventory
       (company_id, product_id, quantity, stock_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company_id, product_id, quantity, stock_status]
    );

    return success(res, "Inventory created successfully", result.rows[0]);
  } catch (error) {
    console.error("Create Inventory Error:", error);
    return failure(res, "Failed to create inventory", 500);
  }
};


//  UPDATE INVENTORY 
export const updateInventory = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    const company_id = req.company.id;

    if (quantity == null) return failure(res, "quantity is required");

    const existing = await pool.query(
      `SELECT * FROM company_schema.inventory
       WHERE id = $1 AND company_id = $2`,
      [id, company_id]
    );

    if (existing.rows.length === 0)
      return failure(res, "Inventory item not found");

    const stock_status = quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

    const updated = await pool.query(
      `UPDATE company_schema.inventory
       SET quantity = $1, stock_status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [quantity, stock_status, id]
    );

    return success(res, "Inventory updated successfully", updated.rows[0]);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    return failure(res, "Failed to update inventory", 500);
  }
};


//  INVENTORY LIST 
export const getInventoryList = async (req, res) => {
  try {
    const company_id = req.company.id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM company_schema.inventory WHERE company_id = $1`,
      [company_id]
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated data
    const list = await pool.query(
      `
      SELECT
        inv.id,
        inv.product_id,
        inv.quantity,
        inv.stock_status,
        inv.created_at,
        inv.updated_at,
        p.product_name,
        p.chemical_composition
      FROM company_schema.inventory inv
      JOIN company_schema.products p
        ON inv.product_id = p.id
      WHERE inv.company_id = $1
      ORDER BY inv.id DESC
      LIMIT $2 OFFSET $3
      `,
      [company_id, limit, offset]
    );

    // Format response for frontend
    const formatted = list.rows.map(item => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      chemical_composition: item.chemical_composition, // JSONB
      quantity: item.quantity,
      stock_status: item.stock_status,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      status: "success",
      message: "Inventory list fetched",
      data: formatted,
      pagination: {
        currentPage: page,
        limit: limit,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Get Inventory List Error:", error);
    return failure(res, "Failed to fetch inventory list", 500);
  }
};




//  GET SINGLE INVENTORY 
export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const result = await pool.query(
      `SELECT inv.*, p.product_name
       FROM company_schema.inventory inv
       LEFT JOIN company_schema.products p
       ON inv.product_id = p.id
       WHERE inv.id = $1 AND inv.company_id = $2`,
      [id, company_id]
    );

    if (result.rows.length === 0)
      return failure(res, "Inventory item not found");

    return success(res, "Inventory details fetched", result.rows[0]);
  } catch (error) {
    console.error("Get Inventory By ID Error:", error);
    return failure(res, "Failed to fetch inventory details", 500);
  }
};


//  DELETE INVENTORY 
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.company.id;

    const exists = await pool.query(
      `SELECT id FROM company_schema.inventory
       WHERE id = $1 AND company_id = $2`,
      [id, company_id]
    );

    if (exists.rows.length === 0)
      return failure(res, "Inventory item not found");

    await pool.query(
      `DELETE FROM company_schema.inventory WHERE id = $1`,
      [id]
    );

    return success(res, "Inventory deleted successfully");
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return failure(res, "Failed to delete inventory", 500);
  }
};

// BULK DELETE INVENTORIES
export const deleteInventories = async (req, res) => {
  try {
    const { ids } = req.body;
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of inventory IDs is required");
    }

    // Validate all IDs are numbers
    const invalidIds = ids.filter(id => isNaN(id));
    if (invalidIds.length > 0) {
      return failure(res, "Invalid inventory ID format");
    }

    // Delete inventories and return deleted data
    const deleted = await pool.query(
      `DELETE FROM company_schema.inventory
       WHERE id = ANY($1) AND company_id = $2
       RETURNING *`,
      [ids, company_id]
    );

    if (deleted.rows.length === 0) {
      return failure(res, "No inventory items found to delete", 404);
    }

    return success(
      res, 
      `${deleted.rows.length} inventory item(s) deleted successfully`, 
      deleted.rows
    );

  } catch (error) {
    console.error("Bulk Delete Inventories Error:", error);
    return failure(res, "Failed to delete inventories", 500);
  }
};
