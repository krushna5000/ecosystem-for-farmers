import pool from "../config/db.js";
import { success, failure } from "../utils/response.js";


  //  CREATE INVENTORY (VENDOR)

export const createInventory = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const vendor_id = req.vendor.id; // ✔ vendor from token

    if (!product_id) return failure(res, "product_id is required");
    if (quantity == null) return failure(res, "quantity is required");

    // Check product belongs to this vendor
    const product = await pool.query(
      `SELECT id FROM vendor_schema.products
       WHERE id = $1 AND vendor_id = $2`,
      [product_id, vendor_id]
    );

    if (product.rows.length === 0) {
      return failure(res, "Product not found for this vendor");
    }

    // Check inventory already exists
    const exists = await pool.query(
      `SELECT id FROM vendor_schema.inventory
       WHERE product_id = $1 AND vendor_id = $2`,
      [product_id, vendor_id]
    );

    if (exists.rows.length > 0) {
      return failure(res, "Inventory already exists for this product");
    }

    const stock_status = quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

    const result = await pool.query(
      `INSERT INTO vendor_schema.inventory
       (vendor_id, product_id, quantity, stock_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [vendor_id, product_id, quantity, stock_status]
    );

    return success(res, "Inventory created successfully", result.rows[0]);

  } catch (error) {
    console.error("Create Vendor Inventory Error:", error);
    return failure(res, "Failed to create inventory", 500);
  }
};


  //  UPDATE INVENTORY (VENDOR)

export const updateInventory = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    if (quantity == null) return failure(res, "quantity is required");

    const existing = await pool.query(
      `SELECT * FROM vendor_schema.inventory
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendor_id]
    );

    if (existing.rows.length === 0) {
      return failure(res, "Inventory item not found");
    }

    const stock_status = quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

    const updated = await pool.query(
      `UPDATE vendor_schema.inventory
       SET quantity = $1,
           stock_status = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [quantity, stock_status, id]
    );

    return success(res, "Inventory updated successfully", updated.rows[0]);

  } catch (error) {
    console.error("Update Vendor Inventory Error:", error);
    return failure(res, "Failed to update inventory", 500);
  }
};


  //  INVENTORY LIST (VENDOR)

export const getInventoryList = async (req, res) => {
  try {
    const vendor_id = req.vendor.id;

    const list = await pool.query(
      `SELECT inv.*, p.product_name
       FROM vendor_schema.inventory inv
       LEFT JOIN vendor_schema.products p
         ON inv.product_id = p.id
       WHERE inv.vendor_id = $1
       ORDER BY inv.id DESC`,
      [vendor_id]
    );

    const formatted = list.rows.map(item => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      stock_status: item.stock_status,
      vendor_id: item.vendor_id,
      product_id: item.product_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return success(res, "Inventory list fetched", formatted);

  } catch (error) {
    console.error("Get Vendor Inventory List Error:", error);
    return failure(res, "Failed to fetch inventory list", 500);
  }
};


  //  GET SINGLE INVENTORY (VENDOR)

export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const result = await pool.query(
      `SELECT inv.*, p.product_name
       FROM vendor_schema.inventory inv
       LEFT JOIN vendor_schema.products p
         ON inv.product_id = p.id
       WHERE inv.id = $1 AND inv.vendor_id = $2`,
      [id, vendor_id]
    );

    if (result.rows.length === 0) {
      return failure(res, "Inventory item not found");
    }

    return success(res, "Inventory details fetched", result.rows[0]);

  } catch (error) {
    console.error("Get Vendor Inventory By ID Error:", error);
    return failure(res, "Failed to fetch inventory details", 500);
  }
};


  //  DELETE INVENTORY (VENDOR)

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    const exists = await pool.query(
      `SELECT id FROM vendor_schema.inventory
       WHERE id = $1 AND vendor_id = $2`,
      [id, vendor_id]
    );

    if (exists.rows.length === 0) {
      return failure(res, "Inventory item not found");
    }

    await pool.query(
      `DELETE FROM vendor_schema.inventory
       WHERE id = $1`,
      [id]
    );

    return success(res, "Inventory deleted successfully");

  } catch (error) {
    console.error("Delete Vendor Inventory Error:", error);
    return failure(res, "Failed to delete inventory", 500);
  }
};
