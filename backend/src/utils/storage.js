import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

/**
 * Unified file storage used by every portal.
 *  - S3 when AWS_S3_BUCKET_NAME + AWS credentials are configured
 *  - otherwise the local ./uploads directory (served at /uploads) for dev/testing
 *
 * `file` is a multer memory-storage file: { buffer, originalname, mimetype, size }.
 */

const s3Enabled = Boolean(
  env.aws.bucket && env.aws.accessKeyId && env.aws.secretAccessKey,
);

const s3 = s3Enabled
  ? new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    })
  : null;

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");
export const isS3Enabled = () => s3Enabled;

const extOf = (name = "", fallback = "bin") =>
  name.includes(".") ? name.split(".").pop().toLowerCase() : fallback;

const localBaseUrl = () =>
  (env.publicBaseUrl || `http://localhost:${env.port}`).replace(/\/$/, "");

const s3Url = (key) =>
  `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;

/**
 * Upload a multer memory file (or raw buffer) and return its public URL.
 * @param {{file?: object, buffer?: Buffer, mimetype?: string, originalname?: string,
 *          folder: string, key?: string, acl?: string}} opts
 */
export async function uploadFile({
  file,
  buffer,
  mimetype,
  originalname,
  folder,
  key,
  acl,
}) {
  const body = buffer ?? file?.buffer;
  if (!body) throw new Error("uploadFile: no file buffer provided");

  const type = mimetype ?? file?.mimetype ?? "application/octet-stream";
  const name = originalname ?? file?.originalname ?? "";
  const objectName = key ?? `${crypto.randomUUID()}.${extOf(name)}`;
  const objectKey = `${folder}/${objectName}`;

  if (s3Enabled) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: objectKey,
        Body: body,
        ContentType: type,
        ...(acl ? { ACL: acl } : {}),
      }),
    );
    return s3Url(objectKey);
  }

  const dir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, objectName), body);
  return `${localBaseUrl()}/uploads/${objectKey}`;
}

/** Best-effort delete of a file previously returned by uploadFile(). Never throws. */
export async function deleteFile(url) {
  if (!url || typeof url !== "string") return;
  try {
    if (s3Enabled && url.includes(".amazonaws.com/")) {
      const key = decodeURIComponent(url.split(".amazonaws.com/")[1]);
      if (key) {
        await s3.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
      }
      return;
    }
    const marker = "/uploads/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const rel = url.slice(idx + marker.length);
      const target = path.resolve(UPLOADS_DIR, rel);
      // never delete outside the uploads directory
      if (target.startsWith(UPLOADS_DIR) && fs.existsSync(target)) fs.unlinkSync(target);
    }
  } catch (err) {
    console.error("deleteFile failed:", err.message);
  }
}
