import { Router } from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  deleteMultipleTeamMembers,
} from "../controllers/team.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", upload.single("image"), createTeamMember);

router.get("/", getAllTeamMembers);
router.get("/:emp_id", getTeamMemberById);

router.put("/:emp_id", upload.single("image"), updateTeamMember);

router.delete("/bulk-delete", deleteMultipleTeamMembers);
router.delete("/:emp_id", deleteTeamMember);

export default router;
