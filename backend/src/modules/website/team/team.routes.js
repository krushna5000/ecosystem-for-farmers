import { Router } from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  deleteMultipleTeamMembers,
} from "./team.controller.js";
import { upload } from "../../../middleware/website/upload.js";

const router = Router();

router.post("/", upload.single("image"), createTeamMember);

router.get("/", getAllTeamMembers);
router.get("/:emp_id", getTeamMemberById);

router.put("/:emp_id", upload.single("image"), updateTeamMember);

router.delete("/bulk-delete", deleteMultipleTeamMembers);
router.delete("/:emp_id", deleteTeamMember);

export default router;
