// Pure DB I/O for vendor_schema.brands. No business rules, no req/res.
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendorBrands } from "./vendorBrand.schema.js";
import { ciEq, now, pageByVendor, bulkDeleteByVendor } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

const ownBrand = (id, vendorId) => and(eq(vendorBrands.id, id), eq(vendorBrands.vendorId, vendorId));

/** Case-insensitive brand-name lookup within one vendor. */
export async function brandNameExistsInDB(vendorId, brandName, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorBrands.id })
    .from(vendorBrands)
    .where(and(ciEq(vendorBrands.brandName, brandName), eq(vendorBrands.vendorId, vendorId)));
  return Boolean(row);
}

export async function createVendorBrandInDB(values, tx) {
  const [brand] = await exec(tx).insert(vendorBrands).values(values).returning();
  return brand;
}

export function listVendorBrandsInDB(vendorId, { limit, offset }) {
  return pageByVendor(vendorBrands, vendorId, desc(vendorBrands.createdAt), { limit, offset });
}

export async function getVendorBrandByIdInDB(id, vendorId, tx) {
  const [brand] = await exec(tx).select().from(vendorBrands).where(ownBrand(id, vendorId));
  return brand ?? null;
}

export async function updateVendorBrandInDB(id, vendorId, changes, tx) {
  const [updated] = await exec(tx)
    .update(vendorBrands)
    .set({ ...changes, updatedAt: now() })
    .where(ownBrand(id, vendorId))
    .returning();
  return updated ?? null;
}

export async function deleteVendorBrandInDB(id, vendorId, tx) {
  const [deleted] = await exec(tx).delete(vendorBrands).where(ownBrand(id, vendorId)).returning();
  return deleted ?? null;
}

export function bulkDeleteVendorBrandsInDB(vendorId, ids) {
  return bulkDeleteByVendor(vendorBrands, vendorId, ids);
}
