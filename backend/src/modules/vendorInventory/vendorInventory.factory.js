// Pure DB I/O for vendor_schema.inventory. No business rules, no HTTP types.
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendorInventory, vendorProducts } from "./vendorInventory.schema.js";
import { now } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

const ownInventory = (id, vendorId) =>
  and(eq(vendorInventory.id, id), eq(vendorInventory.vendorId, vendorId));

// inventory inv LEFT JOIN products p  ->  { inv, product_name }
const selectInventoryWithProduct = (tx) =>
  exec(tx)
    .select({ inv: vendorInventory, product_name: vendorProducts.productName })
    .from(vendorInventory)
    .leftJoin(vendorProducts, eq(vendorInventory.productId, vendorProducts.id));

export async function productBelongsToVendorInDB(productId, vendorId, tx) {
  const [product] = await exec(tx)
    .select({ id: vendorProducts.id })
    .from(vendorProducts)
    .where(and(eq(vendorProducts.id, productId), eq(vendorProducts.vendorId, vendorId)));
  return Boolean(product);
}

export async function inventoryExistsForProductInDB(productId, vendorId, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorInventory.id })
    .from(vendorInventory)
    .where(and(eq(vendorInventory.productId, productId), eq(vendorInventory.vendorId, vendorId)));
  return Boolean(row);
}

export async function createVendorInventoryInDB(values, tx) {
  const [inventory] = await exec(tx).insert(vendorInventory).values(values).returning();
  return inventory;
}

export async function vendorInventoryExistsInDB(id, vendorId, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorInventory.id })
    .from(vendorInventory)
    .where(ownInventory(id, vendorId));
  return Boolean(row);
}

export async function updateVendorInventoryInDB(id, vendorId, changes, tx) {
  const [updated] = await exec(tx)
    .update(vendorInventory)
    .set({ ...changes, updatedAt: now() })
    .where(ownInventory(id, vendorId))
    .returning();
  return updated ?? null;
}

export function listVendorInventoryInDB(vendorId, tx) {
  return selectInventoryWithProduct(tx)
    .where(eq(vendorInventory.vendorId, vendorId))
    .orderBy(desc(vendorInventory.id));
}

export async function getVendorInventoryByIdInDB(id, vendorId, tx) {
  const [row] = await selectInventoryWithProduct(tx).where(ownInventory(id, vendorId));
  return row ?? null;
}

export async function deleteVendorInventoryInDB(id, vendorId, tx) {
  const [deleted] = await exec(tx).delete(vendorInventory).where(ownInventory(id, vendorId)).returning();
  return deleted ?? null;
}
