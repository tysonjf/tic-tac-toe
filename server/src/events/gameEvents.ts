import { TIoServer, TServerSocket, activeGames, users, waitingRoom } from "src";
import { Game } from "src/gameLogic";
import { removeUsersActiveGame } from "src/services/manageUsers";

export function configureGameEvents(socket: TServerSocket, io: TIoServer) {
  socket.on("lookingForGame", (cb) => {
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
        socket.to(waitingOpponent.userSocket).emit("gameStarted", {
          roomId: game.roomId,
          playerCode: game.getPlayerCodeBySocketId(waitingOpponent.userSocket)
            .playerCode,
        });
        cb({
          success: true,
          data: {
            roomId: game.roomId,
            playerCode: game.getPlayerCodeBySocketId(socket.id).playerCode,
          },
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
  socket.on("makeMove", (rowIndex, cellIndex, playerCode) => {
    const activeGame = activeGames.find((game) =>
      game.players.some((player) => player.socketId === socket.id),
    );
    activeGame.insertMove(rowIndex, cellIndex, playerCode);
    const isWinner = activeGame.checkWinner();
    if (isWinner.complete) {
      io.to(activeGame.roomId).emit("gameOver", {
        complete: isWinner.complete,
        winner: isWinner.winner,
      });
    }
    socket.broadcast.to(activeGame.roomId).emit("opponentMoved", {
      rowIndex,
      cellIndex,
      playerCode,
    });
  });
  socket.on("leaveGame", () => {
    const activeGame = activeGames.find((game) =>
      game.players.some((player) => player.socketId === socket.id),
    );
    socket.broadcast.to(activeGame.roomId).emit("opponentLeftGame");
    removeUsersActiveGame(socket.id);
  });
}
