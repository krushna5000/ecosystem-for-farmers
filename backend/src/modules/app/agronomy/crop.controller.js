import Crop from "./crop.mongoModel.js";

export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find({}).lean();

    return res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error("Get All Crops Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch crops",
    });
  }
};
