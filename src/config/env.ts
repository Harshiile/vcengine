import { envSchema } from "../@types/env";
import "dotenv/config";

export const ENV = envSchema.parse(process.env);
