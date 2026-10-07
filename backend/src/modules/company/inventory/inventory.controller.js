import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { companyInventory, companyProducts } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { getPagination, getPaginationMeta } from "../../../utils/company/pagination.util.js";
import { success, failure } from "../../../utils/company/response.js";
import {
  bodyOf,
  countOwned,
  findOwned,
  hasInvalidIds,
  nowSql,
  removeManyOwned,
  removeOwned,
} from "../../../utils/company/helpers.js";

const stockStatusFor = (quantity) => (quantity > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

//  CREATE INVENTORY
export const createInventory = async (req, res) => {
  try {
    const { product_id, quantity } = bodyOf(req);
    const company_id = req.company.id;

    if (!product_id) return failure(res, "product_id is required");
    if (quantity == null) return failure(res, "quantity is required");

    const product = await findOwned(companyProducts, product_id, company_id);

    if (!product) return failure(res, "Product not found for this company");

    const [exists] = await db
      .select({ id: companyInventory.id })
      .from(companyInventory)
      .where(
        and(
          eq(companyInventory.productId, product_id),
          eq(companyInventory.companyId, company_id),
        ),
      );

    if (exists) return failure(res, "Inventory already exists for this product");

    const [inventory] = await db
      .insert(companyInventory)
      .values({
        companyId: company_id,
        productId: product_id,
        quantity,
        stockStatus: stockStatusFor(quantity),
      })
      .returning();

    return success(res, "Inventory created successfully", snakeKeys(inventory));
  } catch (error) {
    console.error("Create Inventory Error:", error);
    return failure(res, "Failed to create inventory", 500);
  }
};

//  UPDATE INVENTORY
export const updateInventory = async (req, res) => {
  try {
    const { quantity } = bodyOf(req);
    const { id } = req.params;
    const company_id = req.company.id;

    if (quantity == null) return failure(res, "quantity is required");

    const existing = await findOwned(companyInventory, id, company_id);

    if (!existing) return failure(res, "Inventory item not found");

    const [updated] = await db
      .update(companyInventory)
      .set({ quantity, stockStatus: stockStatusFor(quantity), updatedAt: nowSql })
      .where(
        and(eq(companyInventory.id, id), eq(companyInventory.companyId, company_id)),
      )
      .returning();

    return success(res, "Inventory updated successfully", snakeKeys(updated));
  } catch (error) {
    console.error("Update Inventory Error:", error);
    return failure(res, "Failed to update inventory", 500);
  }
};

//  INVENTORY LIST
export const getInventoryList = async (req, res) => {
  try {
    const company_id = req.company.id;

    const { page, limit, offset } = getPagination(req);

    const totalItems = await countOwned(companyInventory, company_id);

    const list = await db
      .select({
        id: companyInventory.id,
        productId: companyInventory.productId,
        productName: companyProducts.productName,
        chemicalComposition: companyProducts.chemicalComposition,
        quantity: companyInventory.quantity,
        stockStatus: companyInventory.stockStatus,
        createdAt: companyInventory.createdAt,
        updatedAt: companyInventory.updatedAt,
      })
      .from(companyInventory)
      .innerJoin(companyProducts, eq(companyInventory.productId, companyProducts.id))
      .where(eq(companyInventory.companyId, company_id))
      .orderBy(desc(companyInventory.id))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      status: "success",
      message: "Inventory list fetched",
      data: snakeRows(list),
      pagination: getPaginationMeta({ page, limit, totalItems }),
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

    const [row] = await db
      .select({
        id: companyInventory.id,
        companyId: companyInventory.companyId,
        productId: companyInventory.productId,
        quantity: companyInventory.quantity,
        stockStatus: companyInventory.stockStatus,
        createdAt: companyInventory.createdAt,
        updatedAt: companyInventory.updatedAt,
        productName: companyProducts.productName,
      })
      .from(companyInventory)
      .leftJoin(companyProducts, eq(companyInventory.productId, companyProducts.id))
      .where(
        and(eq(companyInventory.id, id), eq(companyInventory.companyId, company_id)),
      );

    if (!row) return failure(res, "Inventory item not found");

    return success(res, "Inventory details fetched", snakeKeys(row));
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

    const deleted = await removeOwned(companyInventory, id, company_id);

    if (!deleted) return failure(res, "Inventory item not found");

    return success(res, "Inventory deleted successfully");
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return failure(res, "Failed to delete inventory", 500);
  }
};

// BULK DELETE INVENTORIES
export const deleteInventories = async (req, res) => {
  try {
    const { ids } = bodyOf(req);
    const company_id = req.company.id;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return failure(res, "Array of inventory IDs is required");
    }

    // Validate all IDs are numbers
    if (hasInvalidIds(ids)) {
      return failure(res, "Invalid inventory ID format");
    }

    // Delete inventories and return deleted data
    const deleted = await removeManyOwned(companyInventory, ids, company_id);

    if (deleted.length === 0) {
      return failure(res, "No inventory items found to delete", 404);
    }

    return success(
      res,
      `${deleted.length} inventory item(s) deleted successfully`,
      snakeRows(deleted),
    );
  } catch (error) {
    console.error("Bulk Delete Inventories Error:", error);
    return failure(res, "Failed to delete inventories", 500);
  }
};
