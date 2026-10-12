import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import * as prototypeGddController from "./prototypeGdd.controller.js";

// Mounted at /api/prototypes/gdd (routes/prototypes.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// POST /transform — fetch a Farmonaut forecast and compute total growing degree days
router.post("/transform", prototypeGddController.transformGdd);

export default router;
