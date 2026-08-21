import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create multer-s3 instance
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET_NAME || "backendkrushna-farmseasy",
  contentType: function (req, file, cb) {
    cb(null, file.mimetype);
  },
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
    });
  },
  key: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, `vendors/${filename}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// multer middleware with S3 storage
export const uploadS3 = multer({
  storage: s3Storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Function to delete file from S3
export const deleteS3File = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes("amazonaws.com")) return;

  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    const key = fileUrl.split(".amazonaws.com/")[1];

    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted file: ${key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error.message);
  }
};