import { addFarmFromWhatsapp } from "../../services/whatsapp/farmService.js";

const addFarm = async (req, res) => {
  try {
    const { phone_number, farm_name, pincode, area_acres, lat, lng } = req.body;

    if (!phone_number || !farm_name || !pincode || !area_acres || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "All fields required: phone_number, farm_name, pincode, area_acres, lat, lng",
      });
    }

    const result = await addFarmFromWhatsapp({
      phoneNumber: phone_number,
      farmName: farm_name,
      pincode,
      areaAcres: parseFloat(area_acres),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });

    return res.status(201).json({
      success: true,
      message: "Farm added successfully",
      data: result,
    });
  } catch (error) {
    console.error("WhatsApp addFarm Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add farm",
    });
  }
};

export default { addFarm };
