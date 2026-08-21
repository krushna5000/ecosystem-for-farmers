import multer from "multer";

// Memory storage (required for AWS S3)
const storage = multer.memoryStorage();

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

//  NAMED EXPORT (this is important)
export const uploadBrandImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("logo");