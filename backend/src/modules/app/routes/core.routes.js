import { Router } from "express";
import authController from "../controllers/authController.js";
import farmController from "../controllers/farmController.js";
import whatsappAuthController from "../controllers/whatsapp/authController.js";
import whatsappFarmController from "../controllers/whatsapp/farmController.js";
import { getFieldIndices } from "../controllers/indexesController.js";
import { pincodeBoundary } from "../controllers/pincodeBoundary.js";
import authMiddleware, { detectUserType, validateFieldRequest } from "../middleware/authMiddleware.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ---- /auth ----
const auth = Router();
auth.post("/register/send-otp", detectUserType, sendOtpLimiter, authController.registerSendOtp);
auth.post("/register/verify-otp", verifyOtpLimiter, authController.registerVerifyOtp);
auth.post("/login/send-otp", sendOtpLimiter, authController.loginSendOtp);
auth.post("/login/verify-otp", verifyOtpLimiter, authController.loginVerifyOtp);
auth.post("/logout", authController.logout);
auth.get("/verify-auth", authMiddleware, authController.verifyAuth);
auth.get("/profile", authMiddleware, authController.getProfile);
auth.put("/profile", authMiddleware, authController.updateProfile);

// ---- /farms ----
const farms = Router();
// Farm APIs
farms.post("/add-farm", authMiddleware, farmController.addFarm);
farms.get("/get-farms/:user_id", authMiddleware, farmController.getFarmsByUser);
farms.get("/get-farm/:farm_id", authMiddleware, farmController.getFarmById);
farms.put("/update-farm/:farm_id", authMiddleware, farmController.updateFarm);
farms.delete("/delete-farm/:farm_id", authMiddleware, farmController.deleteFarm);
farms.get("/get-all-pincodes", authMiddleware, farmController.getAllPincodes);
farms.get("/indices/:fieldId", validateFieldRequest, getFieldIndices);
// Farm Crop APIs
farms.get("/get-all-crops", authMiddleware, farmController.getAllCrops);
farms.post("/add-farm-crop", authMiddleware, farmController.addFarmCrop);
farms.get("/get-farm-crops/:farm_id", authMiddleware, farmController.getFarmCropsByFarm);
farms.get("/get-farm-crops-by-user/:user_id", authMiddleware, farmController.getFarmCropsByUser);
farms.get("/get-farm-crop/:id", authMiddleware, farmController.getFarmCropById);
farms.put("/update-farm-crop/:id", authMiddleware, farmController.updateFarmCrop);
farms.delete("/delete-farm-crop/:id", authMiddleware, farmController.deleteFarmCrop);
farms.get("/pincode-boundary/:pincode", authMiddleware, pincodeBoundary);

// ---- /whatsapp-auth ----
const whatsappAuth = Router();
whatsappAuth.post("/check-user", whatsappAuthController.checkUser);
whatsappAuth.post("/register", whatsappAuthController.registerUser);

// ---- /whatsapp-farm ----
const whatsappFarm = Router();
whatsappFarm.post("/add-farm", whatsappFarmController.addFarm);

router.use("/auth", auth);
router.use("/farms", farms);
router.use("/whatsapp-auth", whatsappAuth);
router.use("/whatsapp-farm", whatsappFarm);

export default router;
