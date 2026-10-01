import sharp from "sharp";

export async function normalizeImage(buffer) {
  const normalizedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return normalizedBuffer;
}
