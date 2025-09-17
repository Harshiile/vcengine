import { authRouter } from "./auth.router";
import { videoRouter } from "./video.router";

import { Router } from "express";
export const router = Router();

router.use("/video", videoRouter);
router.use("/auth", authRouter);
export { videoRouter, authRouter };
