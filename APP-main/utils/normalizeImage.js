import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function normalizeImage(inputPath) {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));

  // ALWAYS create a new file
  const outputPath = path.join(dir, `${baseName}-normalized.jpg`);

  await sharp(inputPath)
    .rotate()
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}
