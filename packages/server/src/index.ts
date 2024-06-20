// import { createServer } from "http";
import https from "node:https"
import express from "express";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "@tic-tac-toe/shared/socketTypes";
import { Game } from "./gameLogic";
import { configureGameEvents } from "./events/gameEvents";
import {
  removeUserFromWaitingRoom,
  removeUsersActiveGame,
} from "./services/manageUsers";
const app = express();
// const httpServer = createServer(app);
const httpsServer = https.createServer(app);
const PORT = process.env.PORT || 3000;
export type TServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type TIoServer = typeof io;
// const cors = env.NODE_ENV === "production" ? "https://tictactoe.tysontech.org" : "http://localhost:3000";
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpsServer, {
  cors: {
    origin: "https://tictactoe.tysontech.org"
  },
});

export const users: Array<{
  socketId: string;
  username: string;
  lastActive: number;
}> = [];
export const waitingRoom: Array<{
  roomId: string;
  socketId: string;
  username: string;
  lastActive: number;
}> = [];
export const activeGames: Array<Game> = [];

const ACTIVE_GAME_TIMEOUT = 1000 * 60 * 15;
setInterval(() => {
  // Remove inactive games
  // And remove users from waiting room if they have been waiting for more than 1 hour
  // This is to prevent memory leaks
  activeGames.forEach((game, index) => {
    if (game.lastActive < Date.now() - ACTIVE_GAME_TIMEOUT) {
      activeGames.splice(index, 1)
    }
  });
  waitingRoom.forEach((user, index) => {
    if (user.lastActive < Date.now() - ACTIVE_GAME_TIMEOUT) {
      waitingRoom.splice(index, 1);
    }
  });
  users.forEach((user, index) => {
    if (user.lastActive < Date.now() - ACTIVE_GAME_TIMEOUT) {
      users.splice(index, 1);
    }
  });
  // where should I trigger an update for the user being active?
  // I think it should be in the event that the user sends a message
}, ACTIVE_GAME_TIMEOUT);

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
// health check url
app.get("/health", (_req, res) => {
  res.send("ok");
});
httpsServer.listen(PORT, () => {
  console.log("listening on *:3000");
});
