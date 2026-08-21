import express from "express";
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  deleteMultipleJobs,
} from "../controllers/jobController.js";

const router = express.Router();

router.delete("/jobs/bulk-delete", deleteMultipleJobs);


// Create a new job
router.post("/post-job", createJob);

// Get all jobs
router.get("/jobs", getJobs);

// Update a job
router.put("/update-job/:id", updateJob);

// Delete a job
router.delete("/delete-job/:id", deleteJob);

export { router as jobsRoutes };
