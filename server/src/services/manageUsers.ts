import { TIoServer, activeGames, waitingRoom } from "@src/index";

export function removeUsersActiveGame(socketId: string, io: TIoServer) {
  const activeGameIndex = activeGames.findIndex((game) => game.players.some((player) => player.socketId === socketId));
  if (activeGameIndex !== -1) {
    const activeGame = activeGames[activeGameIndex];
    const opponent = activeGame.getOpponentByCurrentUserSocketId(socketId);
    io.to(opponent.socketId).emit("opponentLeftGame");
    activeGames.splice(activeGameIndex, 1);
  }
}
export function removeUserFromWaitingRoom(socketId: string) {
  const index = waitingRoom.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    waitingRoom.splice(index, 1);
  }
}
