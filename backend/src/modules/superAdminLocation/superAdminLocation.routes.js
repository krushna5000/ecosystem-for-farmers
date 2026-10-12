import { Router } from "express";
import { authMiddleware } from "../../middleware/superAdminAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateQuery } from "../../middleware/validate.js";
import {
  listQuerySchema,
  createStateSchema,
  updateStateSchema,
  createDistrictSchema,
  updateDistrictSchema,
  createCitySchema,
  updateCitySchema,
  createVillageSchema,
  updateVillageSchema,
  createPincodeSchema,
  updatePincodeSchema,
  bulkDeleteStatesSchema,
  bulkDeleteDistrictsSchema,
  bulkDeleteCitiesSchema,
  bulkDeleteVillagesSchema,
  bulkDeletePincodesSchema,
} from "./superAdminLocation.validator.js";
import * as superAdminLocationController from "./superAdminLocation.controller.js";

// Mounted at /api/super-admin/location (routes/superAdmin.routes.js). Auth is applied per route, as before.
// `:id` params are not validated: the legacy handlers never did (a non-numeric id is a database error).
const router = Router();

router.use(responseStyle("flag"));

// STATES
router.post("/states", authMiddleware, validate(createStateSchema), superAdminLocationController.createState);
router.get("/states", authMiddleware, validateQuery(listQuerySchema), superAdminLocationController.getAllStates);
router.delete(
  "/states/bulk-delete",
  authMiddleware,
  validate(bulkDeleteStatesSchema),
  superAdminLocationController.bulkDeleteStates,
);
router.get("/states/:id", authMiddleware, superAdminLocationController.getStateById);
router.put("/states/:id", authMiddleware, validate(updateStateSchema), superAdminLocationController.updateState);
router.delete("/states/:id", authMiddleware, superAdminLocationController.deleteState);

// DISTRICTS
router.post("/districts", authMiddleware, validate(createDistrictSchema), superAdminLocationController.createDistrict);
router.get("/districts", authMiddleware, validateQuery(listQuerySchema), superAdminLocationController.getAllDistricts);
router.delete(
  "/districts/bulk-delete",
  authMiddleware,
  validate(bulkDeleteDistrictsSchema),
  superAdminLocationController.bulkDeleteDistricts,
);
router.get("/districts/:id", authMiddleware, superAdminLocationController.getDistrictById);
router.put(
  "/districts/:id",
  authMiddleware,
  validate(updateDistrictSchema),
  superAdminLocationController.updateDistrict,
);
router.put("/districts/:id/toggle-active", authMiddleware, superAdminLocationController.toggleDistrictActive);
router.delete("/districts/:id", authMiddleware, superAdminLocationController.deleteDistrict);

// CITIES
router.post("/cities", authMiddleware, validate(createCitySchema), superAdminLocationController.createCity);
router.get("/cities", authMiddleware, validateQuery(listQuerySchema), superAdminLocationController.getAllCities);
router.delete(
  "/cities/bulk-delete",
  authMiddleware,
  validate(bulkDeleteCitiesSchema),
  superAdminLocationController.bulkDeleteCities,
);
router.get("/cities/:id", authMiddleware, superAdminLocationController.getCityById);
router.put("/cities/:id", authMiddleware, validate(updateCitySchema), superAdminLocationController.updateCity);
router.delete("/cities/:id", authMiddleware, superAdminLocationController.deleteCity);
router.put("/cities/:id/toggle-active", authMiddleware, superAdminLocationController.toggleCityActive);

// VILLAGES
router.post("/villages", authMiddleware, validate(createVillageSchema), superAdminLocationController.createVillage);
router.get("/villages", authMiddleware, validateQuery(listQuerySchema), superAdminLocationController.getAllVillages);
router.delete(
  "/villages/bulk-delete",
  authMiddleware,
  validate(bulkDeleteVillagesSchema),
  superAdminLocationController.bulkDeleteVillages,
);
router.get("/villages/:id", authMiddleware, superAdminLocationController.getVillageById);
router.put("/villages/:id", authMiddleware, validate(updateVillageSchema), superAdminLocationController.updateVillage);
router.delete("/villages/:id", authMiddleware, superAdminLocationController.deleteVillage);
router.put("/villages/:id/toggle-active", authMiddleware, superAdminLocationController.toggleVillageActive);

// PINCODES
router.post("/pincode", authMiddleware, validate(createPincodeSchema), superAdminLocationController.createPincode);
router.get("/pincodes", authMiddleware, validateQuery(listQuerySchema), superAdminLocationController.getAllPincodes);
router.delete(
  "/pincodes/bulk-delete",
  authMiddleware,
  validate(bulkDeletePincodesSchema),
  superAdminLocationController.bulkDeletePincodes,
);
router.get("/pincodes/:id", authMiddleware, superAdminLocationController.getPincodeById);
router.put("/pincodes/:id", authMiddleware, validate(updatePincodeSchema), superAdminLocationController.updatePincode);
router.delete("/pincodes/:id", authMiddleware, superAdminLocationController.deletePincode);
router.put("/pincodes/:id/toggle-active", authMiddleware, superAdminLocationController.togglePincodeActive);

// HIERARCHY
router.get("/hierarchy", authMiddleware, superAdminLocationController.getHierarchy);

export default router;
