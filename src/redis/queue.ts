import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const mailQueue = new Queue("mail_queue", {
  connection: redisConnection,
});

export const newVersionCreationQueue = new Queue("new_version_creation_queue", {
  connection: redisConnection
})