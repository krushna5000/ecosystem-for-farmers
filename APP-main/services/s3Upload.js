import fs from "fs";
import s3 from "../config/configs3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const uploadImageToS3 = async ({ filePath, imageHash }) => {
  try {
    const fileStream = fs.createReadStream(filePath);

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // You WANT bucket name inside key as well
    const key = `${bucketName}/crop_ai/${imageHash}-${Date.now()}.jpg`;

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: "image/jpeg",
      ACL: "public-read",
    };

   // console.log("Bucket:", bucketName);
    //console.log("Key:", key);

    await s3.send(new PutObjectCommand(uploadParams));

    // Correct URL structure
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log("Image uploaded to S3:", imageUrl);

    return imageUrl;

  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload image to S3");
  }
};

export default uploadImageToS3;
