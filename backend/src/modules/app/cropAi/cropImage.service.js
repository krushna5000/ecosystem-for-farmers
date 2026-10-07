import { uploadFile } from "../../../utils/storage.js";

// Stores a normalised crop image under crop_ai/ (public-read on S3, local ./uploads otherwise).
const uploadImageToS3 = async ({ buffer, imageHash, mimeType = "image/jpeg" }) => {
  try {
    return await uploadFile({
      buffer,
      mimetype: mimeType,
      folder: "crop_ai",
      key: `${imageHash}-${Date.now()}.jpg`,
      acl: "public-read",
    });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload image to S3");
  }
};

export default uploadImageToS3;
