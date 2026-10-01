import express from "express";
import { getAllLeads, updateLeadStatus } from "../controllers/leadController.js";
import { verifyCompanyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyCompanyToken, getAllLeads);
router.patch("/:id", verifyCompanyToken, updateLeadStatus);

export default router;
