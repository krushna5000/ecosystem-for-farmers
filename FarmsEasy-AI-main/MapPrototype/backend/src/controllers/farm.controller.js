export function submitFarm(req, res) {
  const { coordinates, area_hectares } = req.body;

  // 1. Validate coordinates
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Invalid polygon: minimum 3 coordinates required"
    });
  }

  // 2. Validate each coordinate
  for (const point of coordinates) {
    if (
      typeof point.lat !== "number" ||
      typeof point.lon !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Each coordinate must have numeric lat and lon"
      });
    }
  }

  // 3. Validate area
  if (typeof area_hectares !== "number" || area_hectares <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid area"
    });
  }

  // 4. LOG (Farmonaut-ready payload)
  console.log("Farm polygon received:");
  console.log({
    coordinates,
    area_hectares
  });

  // 5. Success response
  return res.status(200).json({
    success: true,
    message: "Farm boundary submitted successfully"
  });
}
    