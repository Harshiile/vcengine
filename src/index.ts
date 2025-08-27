import express from "express";
import path from "path";
import { ENV } from "./config/env";
import { router } from "./routes";

const app = express();
app.use("/static", express.static(path.join(__dirname, "../public")));
app.use("/", router);

const PORT = ENV.PORT;

app.get("/", (req, res) => {
  res.json({ message: "Hello from Server 3000" });
});

app.listen(PORT, () => {
  console.log(`Server at ${PORT}`);
});
