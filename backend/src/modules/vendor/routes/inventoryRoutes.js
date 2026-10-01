import { Router } from "express";
import {
  createInventory,
  updateInventory,
  getInventoryList,
  getInventoryById,
  deleteInventory,
} from "../controllers/inventoryController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";

const router = Router();

router.use(authenticateVendor);

router.post("/", createInventory);
router.get("/", getInventoryList);
router.get("/:id", getInventoryById);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;
