import express from "express";
import {
  createInventory,
  updateInventory,
  getInventoryList,
  getInventoryById,
  deleteInventory,
  deleteInventories,
} from "./inventory.controller.js";

import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";

const router = express.Router();

router.post("/bulk-delete", verifyCompanyToken, deleteInventories);
router.post("/", verifyCompanyToken, createInventory);
router.get("/", verifyCompanyToken, getInventoryList);
router.get("/:id", verifyCompanyToken, getInventoryById);
router.put("/:id", verifyCompanyToken, updateInventory);
router.delete("/:id", verifyCompanyToken, deleteInventory);

export default router;
