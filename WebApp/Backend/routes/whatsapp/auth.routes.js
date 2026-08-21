import express from "express";
import controller from "../../controllers/whatsapp/authController.js";

const router = express.Router();

router.post("/check-user", controller.checkUser);
router.post("/register", controller.registerUser);

export default router;
