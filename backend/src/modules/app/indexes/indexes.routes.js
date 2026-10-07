import { Router } from "express";
import { fetchAndStoreIndexes } from "./indexes.controller.js";

// Mounted at /indexes (old un-prefixed `app.use("/api", ...)`)
const router = Router();

router.post("/:fieldId", fetchAndStoreIndexes);

export default router;
