import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { farmBoundarySchema } from "./prototypeMap.validator.js";
import * as prototypeMapController from "./prototypeMap.controller.js";

// Mounted at /api/prototypes/map (routes/prototypes.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// POST /farm — validates a drawn farm polygon (Farmonaut-ready payload; nothing is persisted)
router.post("/farm", validate(farmBoundarySchema), prototypeMapController.submitFarmBoundary);

export default router;
