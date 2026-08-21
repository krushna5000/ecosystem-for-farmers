import express from "express";
import controller from "../../controllers/whatsapp/farmController.js";

const router = express.Router();

router.post("/add-farm", controller.addFarm);

export default router;
