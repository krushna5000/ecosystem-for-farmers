import { uploadToS3, generateCropImageKey } from "../config/s3.js";
import { downloadMedia } from "./cropService.js";

/**
 * Download image from WhatsApp and upload to S3
 * @param {string} mediaId - WhatsApp media ID
 * @param {string} prefix - S3 prefix/folder (e.g., "onboarding/{userId}")
 * @returns {Promise<string>} - S3 URL of uploaded image
 */
export async function uploadImageToS3(mediaId, prefix = "onboarding") {
    try {
        const { localPath, s3Url } = await downloadMedia(mediaId);

        if (s3Url) {
            console.log(`[S3] Image uploaded to: ${s3Url}`);
            return s3Url;
        }

        // Fallback: upload local file with custom prefix
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const s3Key = `${prefix}/${timestamp}_${mediaId}.jpg`;
        const url = await uploadToS3(localPath, s3Key);
        console.log(`[S3] Image uploaded to: ${url}`);
        return url;
    } catch (error) {
        console.error("[S3 UPLOAD] ERROR:", error.message);
        throw error;
    }
}

export default {
    uploadImageToS3,
};
