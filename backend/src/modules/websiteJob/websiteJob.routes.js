import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { bulkDeleteSchema } from "./websiteJob.validator.js";
import * as websiteJobController from "./websiteJob.controller.js";

// Mounted at the root of /api/website (routes/website.routes.js). The CMS never protected these routes.
const router = Router();

router.use(responseStyle("flag"));

// Specific paths before /:id
router.delete("/jobs/bulk-delete", validate(bulkDeleteSchema), websiteJobController.deleteMultipleJobs);
router.post("/post-job", websiteJobController.createJob);
router.get("/jobs", websiteJobController.getJobs);
router.put("/update-job/:id", websiteJobController.updateJob);
router.delete("/delete-job/:id", websiteJobController.deleteJob);

export default router;
