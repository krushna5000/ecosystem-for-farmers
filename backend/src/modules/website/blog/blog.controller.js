import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { blogs } from "../../../db/schema/index.js";
import { uploadFile } from "../../../utils/storage.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { isNonEmptyArray, toArray } from "../../../utils/website/helpers.js";

const uploadImages = (files) =>
  Promise.all(files.map((file) => uploadFile({ file, folder: "blogs/images" })));

const uploadVideo = (file) => uploadFile({ file, folder: "blogs/videos" });

/* ================= CREATE ================= */
export const createBlog = async (req, res) => {
  try {
    const body = req.body || {};

    const { title, content } = body;
    const status = body.status || "draft";
    const wordCount = Number(body.word_count || 0);
    const charCount = Number(body.char_count || 0);

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const tags = toArray(body.tags);

    const images = req.files?.images ? await uploadImages(req.files.images) : [];
    const video = req.files?.video ? await uploadVideo(req.files.video[0]) : null;

    const [blog] = await db
      .insert(blogs)
      .values({
        title,
        content,
        tags,
        images,
        video,
        status,
        wordCount,
        charCount,
        publishedAt: status === "published" ? new Date() : null,
      })
      .returning();

    res.status(201).json({
      success: true,
      blog: snakeKeys(blog),
    });
  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= READ ALL ================= */
export const getAllBlogs = async (req, res) => {
  try {
    const rows = await db.select().from(blogs).orderBy(desc(blogs.createdAt));
    res.json({ success: true, blogs: snakeRows(rows) });
  } catch (err) {
    console.error("GET BLOGS ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= READ ONE ================= */
export const getBlogById = async (req, res) => {
  try {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, req.params.id));

    if (!blog) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, blog: snakeKeys(blog) });
  } catch (err) {
    console.error("GET BLOG ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/* ================= UPDATE ================= */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, word_count, char_count } = req.body || {};

    const tags = toArray(req.body?.tags);

    const newImages = req.files?.images ? await uploadImages(req.files.images) : null;
    const newVideo = req.files?.video ? await uploadVideo(req.files.video[0]) : null;

    const changes = {
      title: title ?? null,
      content: content ?? null,
      tags,
      status: status ?? null,
      wordCount: word_count == null ? null : Number(word_count),
      charCount: char_count == null ? null : Number(char_count),
    };
    // images / video are only replaced when new files were uploaded
    if (newImages) changes.images = newImages;
    if (newVideo) changes.video = newVideo;
    // published_at is bumped on every save while the status is "published"
    if (status === "published") changes.publishedAt = new Date();

    const [blog] = await db.update(blogs).set(changes).where(eq(blogs.id, id)).returning();

    res.json({ success: true, blog: blog ? snakeKeys(blog) : undefined });
  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

/* ================= DELETE ================= */
export const deleteBlog = async (req, res) => {
  try {
    await db.delete(blogs).where(eq(blogs.id, req.params.id));

    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("DELETE BLOG ERROR:", err);
    res.status(500).json({ success: false });
  }
};

export const deleteMultipleBlogs = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!isNonEmptyArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "No Blog IDs provided",
      });
    }

    const deleted = await db
      .delete(blogs)
      .where(inArray(blogs.id, ids))
      .returning({ id: blogs.id });

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found for given IDs",
      });
    }

    res.json({
      success: true,
      deletedCount: deleted.length,
      message: "Blogs deleted successfully",
    });
  } catch (err) {
    console.error("BULK DELETE BLOGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
