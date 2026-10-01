import express from "express";
import * as locationController from "../controllers/locationController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// STATES
router.post("/states", authMiddleware, locationController.createState);
router.get("/states", authMiddleware, locationController.getAllStates);
router.delete("/states/bulk-delete", authMiddleware, locationController.bulkDeleteStates);
router.get("/states/:id", authMiddleware, locationController.getStateById);
router.put("/states/:id", authMiddleware, locationController.updateState);
router.delete("/states/:id", authMiddleware, locationController.deleteState);

// DISTRICTS
router.post("/districts", authMiddleware, locationController.createDistrict);
router.get("/districts", authMiddleware, locationController.getAllDistricts);
router.delete("/districts/bulk-delete", authMiddleware, locationController.bulkDeleteDistricts);
router.get("/districts/:id", authMiddleware, locationController.getDistrictById);
router.put("/districts/:id", authMiddleware, locationController.updateDistrict);
router.put("/districts/:id/toggle-active", authMiddleware, locationController.toggleDistrictActive);
router.delete("/districts/:id", authMiddleware, locationController.deleteDistrict);

// CITIES
router.post("/cities", authMiddleware, locationController.createCity);
router.get("/cities", authMiddleware, locationController.getAllCities);
router.delete("/cities/bulk-delete", authMiddleware, locationController.bulkDeleteCities);
router.get("/cities/:id", authMiddleware, locationController.getCityById);
router.put("/cities/:id", authMiddleware, locationController.updateCity);
router.delete("/cities/:id", authMiddleware, locationController.deleteCity);
router.put("/cities/:id/toggle-active", authMiddleware, locationController.toggleCityActive);

// VILLAGES
router.post("/villages", authMiddleware, locationController.createVillage);
router.get("/villages", authMiddleware, locationController.getAllVillages);
router.delete("/villages/bulk-delete", authMiddleware, locationController.bulkDeleteVillages);
router.get("/villages/:id", authMiddleware, locationController.getVillageById);
router.put("/villages/:id", authMiddleware, locationController.updateVillage);
router.delete("/villages/:id", authMiddleware, locationController.deleteVillage);
router.put("/villages/:id/toggle-active", authMiddleware, locationController.toggleVillageActive);

// PINCODES
router.post("/pincode", authMiddleware, locationController.createPincode);
router.get("/pincodes", authMiddleware, locationController.getAllPincodes);
router.delete("/pincodes/bulk-delete", authMiddleware, locationController.bulkDeletePincodes);
router.get("/pincodes/:id", authMiddleware, locationController.getPincodeById);
router.put("/pincodes/:id", authMiddleware, locationController.updatePincode);
router.delete("/pincodes/:id", authMiddleware, locationController.deletePincode);
router.put("/pincodes/:id/toggle-active", authMiddleware, locationController.togglePincodeActive);

// HIERARCHY
router.get("/hierarchy", authMiddleware, locationController.getHierarchy);

export default router;
