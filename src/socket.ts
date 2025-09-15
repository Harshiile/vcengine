import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "./app";

export const server = createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Client Connected : `, socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

export function sendProgress(socketId: string, p: number) {
  io.to(socketId).emit("upload-progress", { progress: p });
}
