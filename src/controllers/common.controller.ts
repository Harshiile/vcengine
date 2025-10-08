import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { CommonService } from "../services/common.service";
import z from "zod";
import { Stream } from "stream";
import { getImageContentSchema, getSignedUrlSchema } from "../@types/requests";

export type getSignedUrlBody = z.infer<typeof getSignedUrlSchema.shape.body>
export type getImageContentParams = z.infer<typeof getImageContentSchema.shape.params>

export class CommonController extends BaseController {
    constructor(private commonService: CommonService) {
        super();
    }


    getSignedUrl = (
        req: Request<{}, {}, getSignedUrlBody>,
        res: Response,
        next: NextFunction
    ): void => {
        this.baseRequest(req, res, next, async () => {
            const { contentType, type } = req.body;
            const { uploadUrl, fileKey } = await this.commonService.getSignedUrl({ contentType, type })
            return { uploadUrl, fileKey }
        })
    }


    getImageContent = async (
        req: Request<getImageContentParams>,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { type, fileId } = req.params;

            const { Body, ContentType } = await this.commonService.getImageContent({ type, fileId });

            ContentType && res.setHeader("Content-Type", ContentType);
            res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // Caching for 1 day

            (Body as Stream).pipe(res);
        } catch (error) {
            throw error;
        }
    }
}