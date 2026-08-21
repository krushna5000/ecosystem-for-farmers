import express from "express";
import cropAdvisory from "../mongoControllers/cropAdvisory.controller.js";

const router = express.Router();

router.get("/", cropAdvisory);

export default router;
