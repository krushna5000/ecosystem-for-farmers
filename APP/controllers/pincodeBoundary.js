export const pincodeBoundary = async (req, res) => {
  const { pincode } = req.params;

  if (!pincode) {
    return res.status(400).json({ error: "Pincode required" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&polygon_geojson=1`,
      {
        headers: {
          "User-Agent": "farm-app",
        },
      },
    );

    const data = await response.json();

    if (!data.length) {
      return res.json(null);
    }

    const place = data[0];

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (place.geojson) {
      return res.json({
        kind: "geojson",
        geometry: place.geojson,
        center: [lat, lon],
      });
    }

    return res.json({
      kind: "buffer",
      center: [lat, lon],
    });
  } catch (err) {
    console.error("Pincode boundary error:", err);
    res.status(500).json({ error: "Failed to fetch boundary" });
  }
};
