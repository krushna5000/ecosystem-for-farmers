import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { vendorInventory, vendorProducts } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";
import { success, failure } from "../../../utils/vendor/response.js";
import { now } from "../../../utils/vendor/helpers.js";

const ownInventory = (id, vendorId) =>
  and(eq(vendorInventory.id, id), eq(vendorInventory.vendorId, vendorId));

const stockStatusFor = (quantity) => (quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

// inventory inv LEFT JOIN products p  ->  inv.*, product_name
const selectInventoryWithProduct = () =>
  db
    .select({ inv: vendorInventory, product_name: vendorProducts.productName })
    .from(vendorInventory)
    .leftJoin(vendorProducts, eq(vendorInventory.productId, vendorProducts.id));

//  CREATE INVENTORY (VENDOR)
export const createInventory = async (req, res) => {
  try {
    const { product_id, quantity } = req.body ?? {};
    const vendor_id = req.vendor.id;

    if (!product_id) return failure(res, "product_id is required");
    if (quantity == null) return failure(res, "quantity is required");

    const [product] = await db
      .select({ id: vendorProducts.id })
      .from(vendorProducts)
      .where(and(eq(vendorProducts.id, product_id), eq(vendorProducts.vendorId, vendor_id)));

    if (!product) {
      return failure(res, "Product not found for this vendor");
    }

    const [exists] = await db
      .select({ id: vendorInventory.id })
      .from(vendorInventory)
      .where(and(eq(vendorInventory.productId, product_id), eq(vendorInventory.vendorId, vendor_id)));

    if (exists) {
      return failure(res, "Inventory already exists for this product");
    }

    const [inventory] = await db
      .insert(vendorInventory)
      .values({ vendorId: vendor_id, productId: product_id, quantity, stockStatus: stockStatusFor(quantity) })
      .returning();

    return success(res, "Inventory created successfully", snakeKeys(inventory));
  } catch (error) {
    console.error("Create Vendor Inventory Error:", error);
    return failure(res, "Failed to create inventory", 500);
  }
};

//  UPDATE INVENTORY (VENDOR)
export const updateInventory = async (req, res) => {
  try {
    const { quantity } = req.body ?? {};
    const { id } = req.params;
    const vendor_id = req.vendor.id;

    if (quantity == null) return failure(res, "quantity is required");

    const [existing] = await db
      .select({ id: vendorInventory.id })
      .from(vendorInventory)
      .where(ownInventory(id, vendor_id));

    if (!existing) {
      return failure(res, "Inventory item not found");
    }

    const [updated] = await db
      .update(vendorInventory)
      .set({ quantity, stockStatus: stockStatusFor(quantity), updatedAt: now() })
      .where(ownInventory(id, vendor_id))
      .returning();

    return success(res, "Inventory updated successfully", snakeKeys(updated));
  } catch (error) {
    console.error("Update Vendor Inventory Error:", error);
    return failure(res, "Failed to update inventory", 500);
  }
};

//  INVENTORY LIST (VENDOR)
export const getInventoryList = async (req, res) => {
  try {
    const rows = await selectInventoryWithProduct()
      .where(eq(vendorInventory.vendorId, req.vendor.id))
      .orderBy(desc(vendorInventory.id));

    const formatted = rows.map(({ inv, product_name }) => ({
      id: inv.id,
      product_name,
      quantity: inv.quantity,
      stock_status: inv.stockStatus,
      vendor_id: inv.vendorId,
      product_id: inv.productId,
      created_at: inv.createdAt,
      updated_at: inv.updatedAt,
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

    const [row] = await selectInventoryWithProduct().where(ownInventory(id, req.vendor.id));

    if (!row) {
      return failure(res, "Inventory item not found");
    }

    return success(res, "Inventory details fetched", {
      ...snakeKeys(row.inv),
      product_name: row.product_name,
    });
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

    const [exists] = await db
      .select({ id: vendorInventory.id })
      .from(vendorInventory)
      .where(ownInventory(id, vendor_id));

    if (!exists) {
      return failure(res, "Inventory item not found");
    }

    await db.delete(vendorInventory).where(ownInventory(id, vendor_id));

    return success(res, "Inventory deleted successfully");
  } catch (error) {
    console.error("Delete Vendor Inventory Error:", error);
    return failure(res, "Failed to delete inventory", 500);
  }
};
