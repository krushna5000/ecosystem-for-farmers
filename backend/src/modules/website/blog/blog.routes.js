import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  deleteMultipleBlogs,
} from "./blog.controller.js";
import { upload } from "../../../middleware/website/upload.js";

const router = Router();

router.delete("/bulk-delete", deleteMultipleBlogs);

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createBlog,
);

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
    { name: "tags[]" },
  ]),
  updateBlog,
);

router.delete("/:id", deleteBlog);

export default router;
