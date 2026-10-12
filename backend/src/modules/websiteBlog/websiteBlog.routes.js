import { Router } from "express";
import { uploadBlogMedia, uploadBlogMediaWithTags } from "../../middleware/websiteUpload.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { createBlogSchema, bulkDeleteSchema } from "./websiteBlog.validator.js";
import * as websiteBlogController from "./websiteBlog.controller.js";

// Mounted at /api/website/blogs (routes/website.routes.js). The CMS never protected these routes.
const router = Router();

router.use(responseStyle("flag"));

// Specific paths before /:id
router.delete("/bulk-delete", validate(bulkDeleteSchema), websiteBlogController.deleteMultipleBlogs);

router.post("/", uploadBlogMedia, validate(createBlogSchema), websiteBlogController.createBlog);
router.get("/", websiteBlogController.getAllBlogs);
router.get("/:id", websiteBlogController.getBlogById);
router.put("/:id", uploadBlogMediaWithTags, websiteBlogController.updateBlog);
router.delete("/:id", websiteBlogController.deleteBlog);

export default router;
