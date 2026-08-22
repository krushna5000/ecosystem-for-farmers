import fs from "fs";
import path from "path";
import crypto from "crypto";

// Local disk storage for dev/testing — avoids requiring real AWS credentials.
// Files are saved under uploads/<folder> and served via the /uploads static route in server.js.
export const uploadToS3 = async (file, folder) => {
  const ext = file.originalname.includes(".")
    ? file.originalname.split(".").pop()
    : "bin";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const dir = path.join(process.cwd(), "uploads", folder);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, fileName), file.buffer);

  const port = process.env.PORT || 5003;
  return `http://localhost:${port}/uploads/${folder}/${fileName}`;
};
