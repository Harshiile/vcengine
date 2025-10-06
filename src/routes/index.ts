import { authRouter } from "./auth.router";
import { videoRouter } from "./video.router";

import { Router } from "express";
import { wsRouter } from "./workspace.router";
import { authValidator } from "../middleware/authValidator";
import { requestValidator } from "../middleware/requestValidator";
import { getImageContentSchema, getSignedUrlSchema } from "../@types/req";
import { CommonController } from "../controllers/common.controller";
import { CommonService } from "../services/common.service";
export const router = Router();


const commonController = new CommonController(new CommonService())

router.post('/get-signed-url', authValidator, requestValidator(getSignedUrlSchema), commonController.getSignedUrl)
router.get('/get-image-content/:type/:fileId', requestValidator(getImageContentSchema), commonController.getImageContent)

router.use("/video", authValidator, videoRouter);
router.use("/auth", authRouter);
router.use("/workspace", authValidator, wsRouter);
