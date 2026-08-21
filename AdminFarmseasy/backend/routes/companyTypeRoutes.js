import express from "express";
import {
  createCompanyType,
  getCompanyTypes,
  updateCompanyType,
  deleteCompanyType,
} from "../controllers/companyTypeController.js";

const router = express.Router();

router.post("/", createCompanyType);
router.get("/", getCompanyTypes);
router.put("/:id", updateCompanyType);
router.delete("/:id", deleteCompanyType);

export default router;
