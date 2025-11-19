import { authRouter } from "./auth.router";
import { videoRouter } from "./video.router";

import { Router } from "express";
import { wsRouter } from "./workspace.router";
import { authValidator } from "../middleware/authValidator";
import { requestValidator } from "../middleware/requestValidator";
import { getImageContentSchema, getSignedUrlSchema } from "../@types/requests";
import { CommonController } from "../controllers/common.controller";
import { CommonService } from "../services/common.service";
export const router = Router();


const commonController = new CommonController(new CommonService())

router.post('/storage/signed-url', authValidator, requestValidator(getSignedUrlSchema), commonController.getSignedUrl)
router.get('/storage/images/:type/:fileId', authValidator, requestValidator(getImageContentSchema), commonController.getImageContent)

router.use("/videos", videoRouter);
router.use("/auth", authRouter);
router.use("/workspaces", authValidator, wsRouter);
