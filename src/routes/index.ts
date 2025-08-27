import { Router } from "express";
import { giveHash, uploadFile } from "../controllers";

export const router = Router();

router.get("/upload", uploadFile);
// router.get("/get-stream");

router.get("/hash", giveHash);
