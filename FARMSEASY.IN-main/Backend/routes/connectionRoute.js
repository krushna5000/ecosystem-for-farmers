import express from "express";
import {
  createConnection,
  getConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
  deleteMultipleConnections,
} from "../controllers/connectionController.js";

const router = express.Router();

router.delete("/connections/bulk-delete", deleteMultipleConnections);
router.post("/connections", createConnection);
router.get("/connections", getConnections);
router.get("/connections/:id", getConnectionById);
router.put("/connections/:id", updateConnection);
router.delete("/connections/:id", deleteConnection);

export  { router as ConnectionRoute };
