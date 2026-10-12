import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { bulkDeleteSchema } from "./websiteConnection.validator.js";
import * as websiteConnectionController from "./websiteConnection.controller.js";

// Mounted at the root of /api/website (routes/website.routes.js). The CMS never protected these routes.
const router = Router();

router.use(responseStyle("flag"));

// Specific paths before /:id
router.delete(
  "/connections/bulk-delete",
  validate(bulkDeleteSchema),
  websiteConnectionController.deleteMultipleConnections,
);
router.post("/connections", websiteConnectionController.createConnection);
router.get("/connections", websiteConnectionController.getConnections);
router.get("/connections/:id", websiteConnectionController.getConnectionById);
router.put("/connections/:id", websiteConnectionController.updateConnection);
router.delete("/connections/:id", websiteConnectionController.deleteConnection);

export default router;
