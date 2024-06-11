import { createServer } from "http";
import express from "express";
import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@shared/socketTypes";
import { Game } from "./gameLogic";
import { configureGameEvents } from "./events/gameEvents";
import {
  removeUserFromWaitingRoom,
  removeUsersActiveGame,
} from "./services/manageUsers";
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
export type TServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type TIoServer = typeof io;
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
  },
});

export const users: Array<{
  socketId: string;
  username: string;
}> = [];
export const waitingRoom: Array<{
  roomId: string;
  socketId: string;
  username: string;
}> = [];
export const activeGames: Array<Game> = [];

io.on("connection", (socket) => {
  configureGameEvents(socket, io);
  socket.on("disconnect", () => {
    const activeGame = activeGames.find((game) =>
      game.players.some((player) => player.socketId === socket.id),
    );
    if (activeGame && !activeGame.gameCompleted) {
      socket.broadcast.to(activeGame.roomId).emit("opponentLeftGame");
    }
    removeUsersActiveGame(socket.id, io);
    removeUserFromWaitingRoom(socket.id);
  });
});
httpServer.listen(PORT, () => {
  console.log("listening on *:3000");
});
