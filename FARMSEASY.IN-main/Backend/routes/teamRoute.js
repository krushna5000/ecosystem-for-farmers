import express from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  deleteMultipleTeamMembers,
} from "../controllers/teamController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

/* CREATE */
router.post(
  "/",
  upload.single("image"),
  createTeamMember
);

/* READ */
router.get("/", getAllTeamMembers);
router.get("/:emp_id", getTeamMemberById);

/* UPDATE */
router.put(
  "/:emp_id",
  upload.single("image"),
  updateTeamMember
);
router.delete("/bulk-delete", deleteMultipleTeamMembers);

/* DELETE */
router.delete("/:emp_id", deleteTeamMember);



export default router;