import express from "express";
import { getAllLeads, updateLeadStatus } from "./lead.controller.js";
import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";

const router = express.Router();

router.get("/", verifyCompanyToken, getAllLeads);
router.patch("/:id", verifyCompanyToken, updateLeadStatus);

export default router;
