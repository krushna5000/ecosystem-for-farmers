import { Router } from "express";

const router = Router();

// POST /farm — validates a drawn farm polygon (Farmonaut-ready payload; nothing is persisted)
router.post("/farm", (req, res) => {
  const { coordinates, area_hectares } = req.body ?? {};

  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Invalid polygon: minimum 3 coordinates required",
    });
  }

  for (const point of coordinates) {
    if (typeof point?.lat !== "number" || typeof point?.lon !== "number") {
      return res.status(400).json({
        success: false,
        message: "Each coordinate must have numeric lat and lon",
      });
    }
  }

  if (typeof area_hectares !== "number" || area_hectares <= 0) {
    return res.status(400).json({ success: false, message: "Invalid area" });
  }

  return res.status(200).json({
    success: true,
    message: "Farm boundary submitted successfully",
  });
});

export default router;
