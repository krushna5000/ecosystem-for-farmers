import multer from "multer";
import multerS3 from "multer-s3";
import crypto from "crypto";

import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const fileFilter = (req, file, cb) => {
  if (!file?.mimetype) return cb(new Error("Invalid file"), false);
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
    return cb(null, true);
  }
  cb(new Error("Only image files are allowed (jpg, jpeg, png)."), false);
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (_req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req, file, cb) => {
      const ext = file.originalname.includes(".")
        ? file.originalname.split(".").pop().toLowerCase()
        : "img";
      const safeExt = ["jpg", "jpeg", "png"].includes(ext) ? ext : "img";
      const unique = crypto.randomBytes(16).toString("hex");
      cb(null, `company_logos/${Date.now()}-${unique}.${safeExt}`);
    },
  }),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

export default upload;


