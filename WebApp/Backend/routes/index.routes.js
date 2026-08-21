import express from "express";
import { fetchAndStoreIndexes } from "../controllers/indexesController.js";

const router = express.Router();

router.post("/indexes/:fieldId", fetchAndStoreIndexes);

export default router;
