import { Router } from "express";
import { uploadTeamImage } from "../../middleware/websiteUpload.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { createTeamMemberSchema, bulkDeleteSchema } from "./websiteTeam.validator.js";
import * as websiteTeamController from "./websiteTeam.controller.js";

// Mounted at /api/website/team (routes/website.routes.js). The CMS never protected these routes.
const router = Router();

router.use(responseStyle("flag"));

// Specific paths before /:emp_id
router.delete("/bulk-delete", validate(bulkDeleteSchema), websiteTeamController.deleteMultipleTeamMembers);

router.post("/", uploadTeamImage, validate(createTeamMemberSchema), websiteTeamController.createTeamMember);
router.get("/", websiteTeamController.getAllTeamMembers);
router.get("/:emp_id", websiteTeamController.getTeamMemberById);
router.put("/:emp_id", uploadTeamImage, websiteTeamController.updateTeamMember);
router.delete("/:emp_id", websiteTeamController.deleteTeamMember);

export default router;
