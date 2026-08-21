// import express from "express";
// import { adminAuth } from "../middleware/adminAuth.js";

// import {
//   addCompany,
//   getAllCompanies,
//   getCompanyById,
//   updateCompany,
//   deleteCompany
// } from "../controllers/companyController.js";

// const router = express.Router();

// router.post("/companies", adminAuth, addCompany);
// router.get("/companies", adminAuth, getAllCompanies);
// router.get("/companies/:id", adminAuth, getCompanyById);
// router.put("/companies/:id", adminAuth, updateCompany);
// router.delete("/companies/:id", adminAuth, deleteCompany);

// export default router;


import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";

import {
  addCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} from "../controllers/companyController.js";

const router = express.Router();

router.post("/companies", adminAuth, addCompany);
router.get("/companies", adminAuth, getAllCompanies);
router.get("/companies/:id", adminAuth, getCompanyById);
router.put("/companies/:id", adminAuth, updateCompany);
router.delete("/companies/:id", adminAuth, deleteCompany);

export default router;
