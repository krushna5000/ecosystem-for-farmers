import { Router } from "express";
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  deleteMultipleJobs,
} from "../controllers/job.controller.js";

const router = Router();

router.delete("/jobs/bulk-delete", deleteMultipleJobs);
router.post("/post-job", createJob);
router.get("/jobs", getJobs);
router.put("/update-job/:id", updateJob);
router.delete("/delete-job/:id", deleteJob);

export default router;
