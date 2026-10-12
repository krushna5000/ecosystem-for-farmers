// Pure DB I/O for company_schema.inventory. No business rules, no req/res.
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { companyInventory, companyProducts } from "./companyInventory.schema.js";
import {
  countOwned,
  findOwned,
  nowSql,
  removeManyOwned,
  removeOwned,
} from "../../utils/companyHelpers.js";

const exec = (tx) => tx ?? db;

const ownInventory = (id, companyId) =>
  and(eq(companyInventory.id, id), eq(companyInventory.companyId, companyId));

/** A product of this company, or null. */
export async function findOwnedProductInDB(productId, companyId, tx) {
  return (await findOwned(companyProducts, productId, companyId, tx)) ?? null;
}

/** Whether the company already tracks inventory for the product. */
export async function inventoryExistsForProductInDB(companyId, productId, tx) {
  const [row] = await exec(tx)
    .select({ id: companyInventory.id })
    .from(companyInventory)
    .where(
      and(eq(companyInventory.productId, productId), eq(companyInventory.companyId, companyId)),
    );
  return Boolean(row);
}

export async function createCompanyInventoryInDB(values, tx) {
  const [inventory] = await exec(tx).insert(companyInventory).values(values).returning();
  return inventory;
}

export async function findOwnedCompanyInventoryInDB(id, companyId, tx) {
  return (await findOwned(companyInventory, id, companyId, tx)) ?? null;
}

export async function updateCompanyInventoryInDB(id, companyId, changes, tx) {
  const [updated] = await exec(tx)
    .update(companyInventory)
    .set({ ...changes, updatedAt: nowSql })
    .where(ownInventory(id, companyId))
    .returning();
  return updated ?? null;
}

export function countCompanyInventoryInDB(companyId, tx) {
  return countOwned(companyInventory, companyId, tx);
}

export function listCompanyInventoryInDB(companyId, { limit, offset }, tx) {
  return exec(tx)
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
    .where(eq(companyInventory.companyId, companyId))
    .orderBy(desc(companyInventory.id))
    .limit(limit)
    .offset(offset);
}

export async function getCompanyInventoryByIdInDB(id, companyId, tx) {
  const [row] = await exec(tx)
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
    .where(ownInventory(id, companyId));
  return row ?? null;
}

export async function deleteCompanyInventoryInDB(id, companyId, tx) {
  return (await removeOwned(companyInventory, id, companyId, tx)) ?? null;
}

export function deleteCompanyInventoriesInDB(companyId, ids, tx) {
  return removeManyOwned(companyInventory, ids, companyId, tx);
}
