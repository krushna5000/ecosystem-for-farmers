// Pure DB I/O for farms_schema.crops, as read by the company portal. No business rules, no req/res.
import { count, desc } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { crops } from "./companyCrop.schema.js";

const exec = (tx) => tx ?? db;

export async function countCropsInDB(tx) {
  const [{ value }] = await exec(tx).select({ value: count() }).from(crops);
  return value;
}

export function listCropsInDB({ limit, offset }, tx) {
  return exec(tx).select().from(crops).orderBy(desc(crops.id)).limit(limit).offset(offset);
}
