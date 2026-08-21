import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload file to S3 bucket
 * @param {string} filePath - Local file path to upload
 * @param {string} s3Key - S3 key/path where file will be stored
 * @returns {Promise<string>} - S3 URL of uploaded file
 */
export async function uploadToS3(filePath, s3Key) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath);

        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!bucketName) {
            throw new Error("AWS_S3_BUCKET_NAME is not set in environment variables");
        }

        const params = {
            Bucket: bucketName,
            Key: s3Key,
            Body: fileContent,
            ContentType: "image/jpeg",
            ACL: "public-read",
        };

        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);

        const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        return s3Url;
    } catch (error) {
        console.error("[S3 UPLOAD] ERROR:", error.message);
        throw new Error(`S3 upload failed: ${error.message}`);
    }
}

/**
 * Generate S3 key for crop images
 * @param {string} phoneNumber - User's phone number
 * @param {string} mediaId - Media ID from WhatsApp
 * @returns {string} - S3 key path
 */
export function generateCropImageKey(phoneNumber, mediaId) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `crops/whatsapp/${phoneNumber}/${timestamp}_${mediaId}.jpg`;
}
