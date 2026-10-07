import express from "express";
import {
  createCompanyType,
  getCompanyTypes,
  updateCompanyType,
  deleteCompanyType,
} from "./companyType.controller.js";

const router = express.Router();

router.post("/", createCompanyType);
router.get("/", getCompanyTypes);
router.put("/:id", updateCompanyType);
router.delete("/:id", deleteCompanyType);

export default router;
