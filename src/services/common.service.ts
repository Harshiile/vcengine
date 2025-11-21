import z from "zod";
import { getImageContentParams, getSignedUrlBody } from "../controllers/common.controller";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { BUCKETS } from "../config/buckets";
import { v4 } from 'uuid'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";

export class CommonService {
    async getSignedUrl({ contentType, type }: getSignedUrlBody) {
        const fileKey = `${v4()}.${contentType.split("/")[1]}`
        let bucketType;

        switch (type) {
            case 'avatar':
                bucketType = BUCKETS.VC_AVATAR
                break;

            case 'clip':
                bucketType = BUCKETS.VC_CLIPS
                break;
            case 'banner':
                bucketType = BUCKETS.VC_BANNER
                break;
        }

        const command = new PutObjectCommand({
            Bucket: bucketType,
            Key: fileKey,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
        return { uploadUrl, fileKey }
    }

    async getImageContent({ type, fileId }: getImageContentParams) {
        const { Body, ContentType } = await s3.send(
            new GetObjectCommand({
                Bucket: type == "avatar" ? BUCKETS.VC_AVATAR : BUCKETS.VC_BANNER,
                Key: fileId,
            })
        );
        return { Body, ContentType };
    }
}