import express from "express";
import { videoRouter, authRouter, router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";

export const app = express();
app.use(cors());
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
