import { Router } from "express";
import whatsappAuthController from "./whatsappAuth.controller.js";
import whatsappFarmController from "./whatsappFarm.controller.js";
import analyzeWhatsappCrop from "./whatsappCrop.controller.js";
import { parseMultipart } from "../../../middleware/app/formidableParser.js";

// WhatsApp bot endpoints: /whatsapp-auth, /whatsapp-farm and /whatsapp (crop analysis)
const router = Router();

const auth = Router();
auth.post("/check-user", whatsappAuthController.checkUser);
auth.post("/register", whatsappAuthController.registerUser);

const farm = Router();
farm.post("/add-farm", whatsappFarmController.addFarm);

const crop = Router();
crop.post("/analyze-crop", parseMultipart, analyzeWhatsappCrop);

router.use("/whatsapp-auth", auth);
router.use("/whatsapp-farm", farm);
router.use("/whatsapp", crop);

export default router;
