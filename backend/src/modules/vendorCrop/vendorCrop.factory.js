// Pure DB I/O for the crop catalogue the vendor portal picks from. No business rules, no HTTP types.
import { desc } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { crops } from "./vendorCrop.schema.js";

const exec = (tx) => tx ?? db;

/** All crops, newest id first. */
export function listCropsInDB(tx) {
  return exec(tx).select().from(crops).orderBy(desc(crops.id));
}
