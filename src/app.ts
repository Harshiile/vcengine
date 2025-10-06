import express from "express";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";

declare global {
  namespace Express {
    export interface Request {
      user: string;
    }
  }
}

export const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Server 3000" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Everything Fine !" });
});

app.use(errorHandler);
