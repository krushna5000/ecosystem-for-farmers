// Business rules for blog posts. Throws AppError subclasses; never touches req/res or db directly.
import {
  createBlogInDB,
  listBlogsInDB,
  getBlogByIdInDB,
  updateBlogInDB,
  deleteBlogInDB,
  bulkDeleteBlogsInDB,
} from "./websiteBlog.factory.js";
import { NotFoundError } from "../../errors/index.js";
import { uploadFile } from "../../utils/storage.js";
import { withLegacy500 } from "../../utils/websiteHelpers.js";

const IMAGE_FOLDER = "blogs/images";
const VIDEO_FOLDER = "blogs/videos";

// Reads and deletes answered a bare `{ success: false }` on unexpected failures; update added a message.
const FAILED = { success: false };
const UPDATE_FAILED = { success: false, message: "Update failed" };

/** multipart text fields may arrive as a single string or an array */
const toArray = (value) => (value ? (Array.isArray(value) ? value : [value]) : []);

const uploadImages = (files) => Promise.all(files.map((file) => uploadFile({ file, folder: IMAGE_FOLDER })));

const uploadVideo = (file) => uploadFile({ file, folder: VIDEO_FOLDER });

/** `files` is multer's files map ({ images?: File[], video?: File[] }). */
export async function createBlog(body, files) {
  const { title, content } = body;
  const status = body.status || "draft";
  const wordCount = Number(body.word_count || 0);
  const charCount = Number(body.char_count || 0);

  const tags = toArray(body.tags);

  const images = files?.images ? await uploadImages(files.images) : [];
  const video = files?.video ? await uploadVideo(files.video[0]) : null;

  return createBlogInDB({
    title,
    content,
    tags,
    images,
    video,
    status,
    wordCount,
    charCount,
    publishedAt: status === "published" ? new Date() : null,
  });
}

export function listBlogs() {
  return withLegacy500("GET BLOGS ERROR:", () => listBlogsInDB(), FAILED);
}

export async function getBlogById(id) {
  const blog = await withLegacy500("GET BLOG ERROR:", () => getBlogByIdInDB(id), FAILED);
  if (!blog) throw new NotFoundError("Blog not found", { body: FAILED });
  return blog;
}

/** Full overwrite of the text fields (omitted ones become NULL); images / video only change when re-uploaded. */
export function updateBlog(id, body, files) {
  return withLegacy500(
    "UPDATE BLOG ERROR:",
    async () => {
      const { title, content, status, word_count, char_count } = body;

      const tags = toArray(body.tags);

      const newImages = files?.images ? await uploadImages(files.images) : null;
      const newVideo = files?.video ? await uploadVideo(files.video[0]) : null;

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

      return updateBlogInDB(id, changes);
    },
    UPDATE_FAILED,
  );
}

export function deleteBlog(id) {
  return withLegacy500("DELETE BLOG ERROR:", () => deleteBlogInDB(id), FAILED);
}

export async function deleteBlogs(ids) {
  const deleted = await bulkDeleteBlogsInDB(ids);
  if (deleted.length === 0) throw new NotFoundError("No blogs found for given IDs");
  return { deletedCount: deleted.length };
}
