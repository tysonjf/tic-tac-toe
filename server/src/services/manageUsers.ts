import { activeGames, waitingRoom } from "src";

export function removeUsersActiveGame(socketId: string) {
  const index = activeGames.findIndex((game) =>
    game.players.some((player) => player.socketId === socketId),
  );
  if (index !== -1) {
    // const roomId = activeGames[index].roomId;
    // io.to(roomId).emit("opponentLeftGame");
    activeGames.splice(index, 1);
  }
}
export function removeUserFromWaitingRoom(socketId: string) {
  const index = waitingRoom.findIndex((user) => user.userSocket === socketId);
  if (index !== -1) {
    waitingRoom.splice(index, 1);
  }
}
