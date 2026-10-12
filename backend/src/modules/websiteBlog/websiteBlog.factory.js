// Pure DB I/O for website_schema.blogs. No business rules, no HTTP types.
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { blogs } from "./websiteBlog.schema.js";

const exec = (tx) => tx ?? db;

export async function createBlogInDB(values, tx) {
  const [blog] = await exec(tx).insert(blogs).values(values).returning();
  return blog;
}

export function listBlogsInDB(tx) {
  return exec(tx).select().from(blogs).orderBy(desc(blogs.createdAt));
}

export async function getBlogByIdInDB(id, tx) {
  const [blog] = await exec(tx).select().from(blogs).where(eq(blogs.id, id));
  return blog ?? null;
}

export async function updateBlogInDB(id, changes, tx) {
  const [blog] = await exec(tx).update(blogs).set(changes).where(eq(blogs.id, id)).returning();
  return blog ?? null;
}

export async function deleteBlogInDB(id, tx) {
  await exec(tx).delete(blogs).where(eq(blogs.id, id));
}

export function bulkDeleteBlogsInDB(ids, tx) {
  return exec(tx).delete(blogs).where(inArray(blogs.id, ids)).returning({ id: blogs.id });
}
