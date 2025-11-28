import { Redis } from "ioredis";
import { ENV } from "./env";

export const redisConnection = new Redis({
  host: ENV.REDIS_HOST ?? "redis",
  port: Number(ENV.REDIS_PORT) ?? 6379,
  maxRetriesPerRequest: null,
});
