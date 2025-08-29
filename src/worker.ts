import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const resolutions = [144, 240, 360, 480, 720, 1080, 1440, 2160];

const workers = resolutions.forEach((res) => {
  new Worker(
    res.toString(),
    async ({ data }) => {
      console.log(`VideoId : ${data} | Resolution : ${res}`);
    },
    { connection }
  );
});
