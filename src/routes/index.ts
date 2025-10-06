import { authRouter } from "./auth.router";
import { videoRouter } from "./video.router";

import { Router } from "express";
import { wsRouter } from "./workspace.router";
import { authValidator } from "../middleware/authValidator";
export const router = Router();

router.use("/video", videoRouter);
// router.use("/video",authValidator, videoRouter);
router.use("/auth", authRouter);
router.use("/workspace",authValidator, wsRouter);
