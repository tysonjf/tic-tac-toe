import { TIoServer, TServerSocket, activeGames, users, waitingRoom } from "@src/index";
import { Game } from "@src/gameLogic";
import { removeUserFromWaitingRoom, removeUsersActiveGame } from "@src/services/manageUsers";
import crypto from "crypto";
export function configureGameEvents(socket: TServerSocket, io: TIoServer) {
  socket.on("submitUsername", (username, cb) => {
    users.push({
      socketId: socket.id,
      username,
    });
    cb(true);
  });
  socket.on('playerCurrentOpponentAgain', async () => {
    const activeGame = activeGames.find((game) =>
      game.players.some((player) => player.socketId === socket.id),
    );
    const opponent = activeGame.getOpponentByCurrentUserSocketId(socket.id)
    if (activeGame.playerWantsReplay && activeGame.playerWantsReplay !== socket.id) {
      activeGame.startNewGame()
      const opponent = activeGame.getOpponentByCurrentUserSocketId(socket.id)
      const currentPlayer = activeGame.getPlayerBySocketId(socket.id)
      io.to(socket.id).emit('gameStarted', {
        playerCode: currentPlayer.playerCode,
        opponentUsername: opponent.username
      })
      socket.to(opponent.socketId).emit('gameStarted', {
        playerCode: opponent.playerCode,
        opponentUsername: currentPlayer.username
      })
    } else if (activeGame.playerWantsReplay !== socket.id) {
      socket.to(opponent.socketId).emit('opponentWantsToPlayAgain')
      activeGame.playerWantsReplay = socket.id
    }
  })
  socket.on("lookingForGame", (cb) => {
    removeUsersActiveGame(socket.id, io);
    const currentUser = users.find((user) => user.socketId === socket.id);
    if (waitingRoom.length > 0) {
      const waitingOpponent = waitingRoom.shift(); // if there are other users in the waiting room, match them with this user
      if (waitingOpponent) {
        socket.join(waitingOpponent.roomId);
        const game = new Game(waitingOpponent.roomId, [
          {
            username: waitingOpponent.username,
            socketId: waitingOpponent.socketId,
          },
          { username: currentUser.username, socketId: socket.id },
        ]);
        activeGames.push(game);
        socket.to(waitingOpponent.socketId).emit("gameStarted", {
          playerCode: game.getPlayerBySocketId(waitingOpponent.socketId)
            .playerCode,
          opponentUsername: currentUser.username,
        });
        cb({
          success: true,
          data: {
            playerCode: game.getPlayerBySocketId(socket.id).playerCode,
            opponentUsername: waitingOpponent.username,
          },
        });
      }
    } else {
      // else we can go ahead and add the current user to the waitingRoom and create their own game room
      const roomId = crypto.randomUUID();
      socket.join(roomId);
      waitingRoom.push({
        roomId: roomId,
        socketId: socket.id,
        username: currentUser.username,
      });
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
    // const activeGame = activeGames.find((game) =>
    //   game.players.some((player) => player.socketId === socket.id),
    // );
    // socket.broadcast.to(activeGame.roomId).emit("opponentLeftGame");
    removeUserFromWaitingRoom(socket.id)
    removeUsersActiveGame(socket.id, io);
  });
}
