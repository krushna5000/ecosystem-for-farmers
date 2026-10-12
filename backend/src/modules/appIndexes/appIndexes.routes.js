import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import * as appIndexesController from "./appIndexes.controller.js";

// Mounted at /api/app/indexes (routes/app.routes.js)
const router = Router();

router.use(responseStyle("flag"));

router.post("/:fieldId", appIndexesController.fetchAndStoreIndexes);

export default router;
