import { Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import process from "child_process";

export const uploadFile = (req: Request, res: Response) => {
  // fs.createReadStream(path.join(__dirname, `../../public/50mb.txt`)).pipe(
  //   fs.createWriteStream(`./.txt`)
  // );
  const { videoName } = req.query;
  const st = fs.createReadStream(
    path.join(__dirname, `../../public/${videoName}`)
  );
  res.setHeader("Content-type", "video/mp4");
  st.on("data", (data) => res.write(data));
  st.on("end", () => res.end("DONE"));
};

export const giveHash = async (req: Request, res: Response) => {
  const { videoName } = req.query;
  const videoPath = path.join(__dirname, `../../public/${videoName}`);
  let resolution: null | string = null;

  process.exec(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${videoPath}`,
    (err, data, stderr) => {
      resolution = data;
      new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(videoPath);

        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
        stream.on("error", reject);
      })
        .then((hash) => res.json({ resolution, hash }))
        .catch((err) => {
          throw new Error(err);
        });
    }
  );
};
