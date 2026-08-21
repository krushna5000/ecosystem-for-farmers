import pool from "../config/db.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

/* ================= CREATE ================= */
export const createBlog = async (req, res) => {
  try {
    const body = req.body || {};

    const title = body.title;
    const content = body.content;
    const status = body.status || "draft";
    const word_count = Number(body.word_count || 0);
    const char_count = Number(body.char_count || 0);

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const tags = body.tags
      ? Array.isArray(body.tags)
        ? body.tags
        : [body.tags]
      : [];

    /* ✅ Upload images to S3 */
    const images = req.files?.images
      ? await Promise.all(
          req.files.images.map((file) =>
            uploadToS3({ file, folder: "blogs/images" })
          )
        )
      : [];

    /* ✅ Upload video to S3 */
    const video = req.files?.video
      ? await uploadToS3({
          file: req.files.video[0],
          folder: "blogs/videos",
        })
      : null;

    const publishedAt = status === "published" ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO website_schema.blogs
       (title, content, tags, images, video, status, word_count, char_count, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        title,
        content,
        tags,
        images,
        video,
        status,
        word_count,
        char_count,
        publishedAt,
      ]
    );

    res.status(201).json({
      success: true,
      blog: result.rows[0],
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
    const result = await pool.query(
      `SELECT * FROM website_schema.blogs ORDER BY created_at DESC`
    );
    res.json({ success: true, blogs: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ================= READ ONE ================= */
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM website_schema.blogs WHERE id=$1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, blog: result.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ================= UPDATE ================= */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, word_count, char_count } = req.body;

    const tags = req.body.tags
      ? Array.isArray(req.body.tags)
        ? req.body.tags
        : [req.body.tags]
      : [];

    const newImages = req.files?.images
      ? await Promise.all(
          req.files.images.map((file) =>
            uploadToS3({ file, folder: "blogs/images" })
          )
        )
      : null;

    const newVideo = req.files?.video
      ? await uploadToS3({
          file: req.files.video[0],
          folder: "blogs/videos",
        })
      : null;

    const result = await pool.query(
      `
      UPDATE website_schema.blogs
      SET title = $1,
          content = $2,
          tags = $3,
          images = COALESCE($4, images),
          video = COALESCE($5, video),
          status = $6::varchar,
          word_count = $7,
          char_count = $8,
          published_at = CASE
            WHEN $6::varchar = 'published' THEN NOW()
            ELSE published_at
          END
      WHERE id = $9
      RETURNING *
      `,
      [
        title,
        content,
        tags,
        newImages,
        newVideo,
        status,
        word_count,
        char_count,
        id,
      ]
    );

    res.json({ success: true, blog: result.rows[0] });
  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

/* ================= UPDATE BLOG IMAGES ONLY ================= */
export const updateBlogImages = async (req, res) => {
  try {
    const { id } = req.params;

    const newImages = req.files?.length
      ? await Promise.all(
          req.files.map((file) =>
            uploadToS3({ file, folder: "blogs/images" })
          )
        )
      : [];

    const result = await pool.query(
      `
      UPDATE website_schema.blogs
      SET images = $1
      WHERE id = $2
      RETURNING *
      `,
      [newImages, id]
    );

    res.status(200).json({
      success: true,
      message: "Images updated successfully",
      blog: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE BLOG IMAGES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update images",
    });
  }
};

/* ================= DELETE ================= */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM website_schema.blogs WHERE id=$1`,
      [id]
    );

    res.json({ success: true, message: "Blog deleted" });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const deleteMultipleBlogs = async (req, res) => {
  try {
    const { ids } = req.body;

    // validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No Blog IDs provided",
      });
    }

    // dynamic placeholders: $1, $2, $3...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

    const result = await pool.query(
      `DELETE FROM website_schema.blogs 
       WHERE id IN (${placeholders})`,
      ids
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found for given IDs",
      });
    }

    res.json({
      success: true,
      deletedCount: result.rowCount,
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
