import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "../public")));
app.use("/", router);

app.get("/", (req, res) => {
  res.json({ message: "Hello from Server 3000" });
});

app.use(errorHandler);
