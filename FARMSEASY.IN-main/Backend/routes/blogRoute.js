import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogImages,
  deleteMultipleBlogs, 
} from "../controllers/blogController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

//bulk delete
router.delete("/bulk-delete", deleteMultipleBlogs);

/* CREATE */
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createBlog
);
/* READ */
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

/* UPDATE */
router.put(
  "/:id",
  
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
     { name: "tags[]" } 
  ]),
  updateBlog
);

/* DELETE */
router.delete("/:id", deleteBlog);

export default router;
