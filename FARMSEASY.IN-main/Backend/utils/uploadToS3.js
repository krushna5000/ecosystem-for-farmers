import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import crypto from "crypto";

export const uploadToS3 = async ({ file, folder }) => {
  try {
    if (!file || !file.buffer) {
      throw new Error("Invalid file buffer");
    }

    const ext = file.originalname.split(".").pop();
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size, // 🔥 KEY FIX
    });

    await s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
