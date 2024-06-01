import { createServer } from "http";
import crypto from "crypto";
import express from "express";
import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@shared/socketTypes";
import { Game } from "./gameLogic";
const app = express();
const httpServer = createServer(app);

type TServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
  },
});

const users: Array<{
  socketId: string;
}> = [];
const waitingRoom: Array<{
  roomId: string;
  userSocket: string;
}> = [];
const activeGames: Array<Game> = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  users.push({
    socketId: socket.id,
  });

  configureSocketEvent(socket);

  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUsersActiveGame(socket.id);
    removeUserFromWaitingRoom(socket.id);
  });
});

function removeUsersActiveGame(socketId: string) {
  const index = activeGames.findIndex((game) =>
    game.players.some((player) => player.socketId === socketId),
  );
  if (index !== -1) {
    const roomId = activeGames[index].roomId;
    io.to(roomId).emit("opponentLeftGame");
    activeGames.splice(index, 1);
  }
}
function removeUserFromWaitingRoom(socketId: string) {
  const index = waitingRoom.findIndex((user) => user.userSocket === socketId);
  if (index !== -1) {
    waitingRoom.splice(index, 1);
  }
}
function configureSocketEvent(socket: TServerSocket) {
  socket.on("lookingForGame", () => {
    removeUsersActiveGame(socket.id);
    if (waitingRoom.length > 0) {
      const waitingOpponent = waitingRoom.shift(); // if there are other users in the waiting room, match them with this user
      if (waitingOpponent) {
        socket.join(waitingOpponent.roomId);
        const game = new Game(waitingOpponent.roomId, [
          waitingOpponent.userSocket,
          socket.id,
        ]);
        activeGames.push(game);
        io.to(waitingOpponent.userSocket).emit("gameStarted", {
          roomId: game.roomId,
          playerCode: game.getPlayerCodeBySocketId(waitingOpponent.userSocket)
            .playerCode,
        });
        io.to(socket.id).emit("gameStarted", {
          roomId: game.roomId,
          playerCode: game.getPlayerCodeBySocketId(socket.id).playerCode,
        });
      }
    } else {
      // else we can go ahead and add the current user to the waitingRoom and create their own game room
      const indexOfCurrentUser = users.findIndex(
        (user) => user.socketId === socket.id,
      );
      if (indexOfCurrentUser) {
        const roomId = crypto.randomUUID();
        socket.join(roomId);
        waitingRoom.push({
          roomId: roomId,
          userSocket: socket.id,
        });
      }
    }
  });
  socket.on("makeMove", (row, cell, playerCode, cb) => {
    const activeGame = activeGames.find((game) =>
      game.players.some((player) => player.socketId === socket.id),
    );
    if (!activeGame) {
      return cb({ row, cell, success: false });
    }
    activeGame.insertMove(row, cell, playerCode);
    const isWinner = activeGame.checkWinner();
    io.to(activeGame.roomId).emit("gameOver", {
      complete: isWinner.complete,
      winner: isWinner.winner,
    });
    socket.broadcast.to(activeGame.roomId).emit("opponentMoved", {
      rowIndex: row,
      cellIndex: cell,
      playerCode: activeGame.getLastMove().playerCode,
    });
    cb({ row, cell, success: true });
  });
}
httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});
