import express from "express";
import {
  videoRouter,
  collabRouter,
  workspaceRouter,
  authRouter,
} from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/workspace", workspaceRouter);
app.use("/collab", collabRouter);
app.use("/video", videoRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello from Server 3000" });
});

app.use(errorHandler);
