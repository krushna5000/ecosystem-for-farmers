// Thin HTTP layer: take the validated request, call the service, send the response. Errors are not caught here —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as websiteBlogService from "./websiteBlog.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys, snakeRows } from "../../utils/rowCase.js";

export async function createBlog(req, res) {
  const blog = await websiteBlogService.createBlog(req.body, req.files);
  sendJson(res, { success: true, blog: snakeKeys(blog) }, 201);
}

export async function getAllBlogs(req, res) {
  const rows = await websiteBlogService.listBlogs();
  sendJson(res, { success: true, blogs: snakeRows(rows) });
}

export async function getBlogById(req, res) {
  const blog = await websiteBlogService.getBlogById(req.params.id);
  sendJson(res, { success: true, blog: snakeKeys(blog) });
}

export async function updateBlog(req, res) {
  const blog = await websiteBlogService.updateBlog(req.params.id, req.body ?? {}, req.files);
  // An unknown id still answers 200 `{ success: true }` (no blog key), as before.
  sendJson(res, { success: true, blog: blog ? snakeKeys(blog) : undefined });
}

export async function deleteBlog(req, res) {
  await websiteBlogService.deleteBlog(req.params.id);
  sendJson(res, { success: true, message: "Blog deleted" });
}

export async function deleteMultipleBlogs(req, res) {
  const { deletedCount } = await websiteBlogService.deleteBlogs(req.body.ids);
  sendJson(res, { success: true, deletedCount, message: "Blogs deleted successfully" });
}
