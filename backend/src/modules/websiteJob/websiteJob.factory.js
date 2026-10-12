// Pure DB I/O for website_schema.jobs. No business rules, no HTTP types.
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { jobs } from "./websiteJob.schema.js";

const exec = (tx) => tx ?? db;

export async function createJobInDB(values, tx) {
  const [row] = await exec(tx).insert(jobs).values(values).returning();
  return row;
}

export function listJobsInDB(tx) {
  return exec(tx).select().from(jobs).orderBy(desc(jobs.jobId));
}

export async function jobExistsInDB(id, tx) {
  const [row] = await exec(tx).select({ id: jobs.jobId }).from(jobs).where(eq(jobs.jobId, id));
  return Boolean(row);
}

export async function updateJobInDB(id, changes, tx) {
  await exec(tx).update(jobs).set(changes).where(eq(jobs.jobId, id));
}

/** Returns the deleted row, or null when there was none. */
export async function deleteJobInDB(id, tx) {
  const deleted = await exec(tx).delete(jobs).where(eq(jobs.jobId, id)).returning({ id: jobs.jobId });
  return deleted[0] ?? null;
}

export function bulkDeleteJobsInDB(ids, tx) {
  return exec(tx).delete(jobs).where(inArray(jobs.jobId, ids)).returning({ id: jobs.jobId });
}
