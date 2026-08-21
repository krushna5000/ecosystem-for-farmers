import CropDiagnosis from "../mongoModels/CropDiagnosis.js";

export const storeCropDiagnosis = async (user_id, diagnosisData, imageHash, imageUrl) => {
  if (!user_id || isNaN(user_id)) {
    const err = new Error('Invalid user_id');
    err.status = 400;
    throw err;
  }
  
  try {
    if (!diagnosisData) {
      throw new Error('Diagnosis data is required');
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
