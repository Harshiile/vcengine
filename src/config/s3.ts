import { S3Client } from "@aws-sdk/client-s3";
import { ENV } from "./env";

export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: ENV.IAM_ACCESS_KEY_ID,
    secretAccessKey: ENV.IAM_SECRET_KEY,
  },
});
