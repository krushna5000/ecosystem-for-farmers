import { Router } from "express";
import {
  createServiceLocation,
  getServiceLocations,
  getServiceLocationById,
  updateServiceLocation,
  deleteServiceLocation
} from "../controllers/serviceLocationController.js";

import { authenticateVendor } from "../middleware/authenticateVendor.js";

const router = Router();

// All routes require vendor authentication
router.use(authenticateVendor);

router.post("/", createServiceLocation);         
router.get("/:vendor_id", getServiceLocations);  
router.get("/location/:id", getServiceLocationById); 
router.put("/:id", updateServiceLocation);       
router.delete("/:id", deleteServiceLocation);   

export { router };
