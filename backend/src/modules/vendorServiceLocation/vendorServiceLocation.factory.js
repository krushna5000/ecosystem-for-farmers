// Pure DB I/O for vendor_schema.service_locations. No business rules, no HTTP types.
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { vendorServiceLocations } from "./vendorServiceLocation.schema.js";
import { now } from "../../utils/vendorHelpers.js";

const exec = (tx) => tx ?? db;

export async function serviceLocationExistsInDB({ vendorId, state, city, pincode }, tx) {
  const [row] = await exec(tx)
    .select({ id: vendorServiceLocations.id })
    .from(vendorServiceLocations)
    .where(
      and(
        eq(vendorServiceLocations.vendorId, vendorId),
        eq(vendorServiceLocations.state, state),
        eq(vendorServiceLocations.city, city),
        eq(vendorServiceLocations.pincode, pincode),
      ),
    );
  return Boolean(row);
}

export async function createServiceLocationInDB(values, tx) {
  const [serviceLocation] = await exec(tx).insert(vendorServiceLocations).values(values).returning();
  return serviceLocation;
}

export function listServiceLocationsByVendorInDB(vendorId, tx) {
  return exec(tx)
    .select()
    .from(vendorServiceLocations)
    .where(eq(vendorServiceLocations.vendorId, vendorId))
    .orderBy(desc(vendorServiceLocations.createdAt));
}

export async function getServiceLocationByIdInDB(id, tx) {
  const [serviceLocation] = await exec(tx)
    .select()
    .from(vendorServiceLocations)
    .where(eq(vendorServiceLocations.id, id));
  return serviceLocation ?? null;
}

export async function updateServiceLocationInDB(id, changes, tx) {
  const [serviceLocation] = await exec(tx)
    .update(vendorServiceLocations)
    .set({ ...changes, updatedAt: now() })
    .where(eq(vendorServiceLocations.id, id))
    .returning();
  return serviceLocation ?? null;
}

export async function deleteServiceLocationInDB(id, tx) {
  const [deleted] = await exec(tx).delete(vendorServiceLocations).where(eq(vendorServiceLocations.id, id)).returning();
  return deleted ?? null;
}
