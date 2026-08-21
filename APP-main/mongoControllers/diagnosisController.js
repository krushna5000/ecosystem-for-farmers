import CropDiagnosis from "../mongoModels/CropDiagnosis.js";

export const storeCropDiagnosis = async (user_id, diagnosisData, imageHash, imageUrl) => {
  try {
    if (!diagnosisData) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis data is required",
      });
    }

    const doc = await CropDiagnosis.create({
      user_id,
      diagnosisData,
      imageHash,
      imageUrl,
    });

    return doc;
  } catch (error) {
    console.error("Store Diagnosis Error:", error);
    throw new Error("FAILED_TO_STORE_DIAGNOSIS");
  }
};
