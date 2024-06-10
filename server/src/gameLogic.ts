type GameBoard = Array<Array<string | undefined>>;
type CheckWinnerReturns = {
  complete: boolean;
  winner: "x" | "o" | "draw";
};
export class Game {
  playerWantsReplay: string
  players: Array<{
    socketId: string;
    playerCode: "x" | "o";
    username: string;
    score: number;
  }>;
  roomId: string;
  board: GameBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];
  moveHistory: Array<{
    rowIndex: number;
    cellIndex: number;
    playerCode: "x" | "o";
  }> = [];
  MAX_MOVES = 9;
  gameCompleted = false;
  gameHistory: Array<{ winnerCode: 'x' | 'o' | 'draw', username: string | undefined }> = []

  constructor(
    roomId: string,
    users: Array<{ socketId: string; username: string }>,
  ) {
    this.players = users.map((user, i) => ({
      socketId: user.socketId,
      username: user.username,
      playerCode: i === 0 ? "x" : "o",
      score: 0,
    }));
    this.roomId = roomId;
  }

  startNewGame() {
    this.board = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ]
    this.gameCompleted = false
    this.moveHistory = []
    this.players = this.players.map((player) => ({ ...player, playerCode: player.playerCode === 'x' ? 'o' : 'x' }))
    this.playerWantsReplay = undefined
  }

  rollBackLastMove() {
    const lastMove = this.moveHistory.at(-1)
    this.board[lastMove.rowIndex][lastMove.cellIndex] = undefined
  }

  getPlayerBySocketId(socketId: string) {
    return this.players.find((player) => player.socketId === socketId);
  }

  getOpponentByCurrentUserSocketId(socketId: string) {
    return this.players.find((player) => player.socketId !== socketId);
  }

  getNextPlayersMove(): "x" | "o" {
    const lastMove = this.moveHistory.at(-1);
    if (!lastMove) {
      return "x";
    } else {
      return lastMove.playerCode === "x" ? "o" : "x";
    }
  }
  getLastMove() {
    return this.moveHistory.at(-1);
  }

  insertMove(row: number, cell: number, value: "x" | "o") {
    if (!this.board[row][cell]) {
      this.board[row][cell] = value;
      this.moveHistory.push({
        rowIndex: row,
        cellIndex: cell,
        playerCode: value,
      });
      return { success: true };
    } else {
      return { success: false };
    }
  }

  checkWinner(): CheckWinnerReturns {
    function checkMatches(
      checkCharacter: "x" | "o",
      rowIndex: number,
      cellIndex: number,
    ): boolean {
      // check along the rows
      if (cellIndex + 2 < this.board[rowIndex].length) {
        if (
          this.board[rowIndex][cellIndex] === checkCharacter &&
          this.board[rowIndex][cellIndex + 1] === checkCharacter &&
          this.board[rowIndex][cellIndex + 2] === checkCharacter
        ) {
          return true;
        }
      }

      if (rowIndex + 2 < this.board.length) {
        // check if there is a match along the y axis (vertical match)
        if (
          this.board[rowIndex][cellIndex] === checkCharacter &&
          this.board[rowIndex + 1][cellIndex] === checkCharacter &&
          this.board[rowIndex + 2][cellIndex] === checkCharacter
        ) {
          return true;
        }
      }
      // check along the diagonal right angle (top left to bottom right) which will be next rowIndex and next cellIndex
      if (
        rowIndex + 2 < this.board.length &&
        cellIndex + 2 < this.board[rowIndex].length
      ) {
        if (
          this.board[rowIndex][cellIndex] === checkCharacter &&
          this.board[rowIndex + 1][cellIndex + 1] === checkCharacter &&
          this.board[rowIndex + 2][cellIndex + 2] === checkCharacter
        ) {
          return true;
        }
      }
      // check along the diagonal left angle (top right to bottom left) which will be next rowIndex and the next cellIndex
      if (rowIndex + 2 < this.board.length && cellIndex - 2 >= 0) {
        if (
          this.board[rowIndex][cellIndex] === checkCharacter &&
          this.board[rowIndex + 1][cellIndex - 1] === checkCharacter &&
          this.board[rowIndex + 2][cellIndex - 2] === checkCharacter
        ) {
          return true;
        }
      }
      return false;
    }

    const boundChecker = checkMatches.bind(this);
    let winner: "x" | "o" | "draw" = "draw";
    let complete = this.moveHistory.length === this.MAX_MOVES;
    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (
        let cellIndex = 0;
        cellIndex < this.board[rowIndex].length;
        cellIndex++
      ) {
        if (this.board[rowIndex][cellIndex] === "x") {
          const xIsWinner = boundChecker("x", rowIndex, cellIndex);
          if (xIsWinner) {
            return {
              complete: true,
              winner: "x",
            };
          }
        } else if (this.board[rowIndex][cellIndex] === "o") {
          const oIsWinner = boundChecker("o", rowIndex, cellIndex);
          if (oIsWinner) {
            return {
              complete: true,
              winner: "o",
            };
          }
        }
      }
    }
    this.gameCompleted = complete;
    if (complete) {
      this.updateScore(winner);
    }
    return { complete, winner };
  }
  updateScore(winner: "x" | "o" | "draw") {
    for (let index = 0; index < this.players.length; index++) {
      if (this.players[index].playerCode === winner) {
        this.players[index].score += 1;
      }
    }
    this.gameHistory.push({
      winnerCode: winner,
      username: winner === 'draw' ? undefined : this.players.find((player) => player.playerCode === winner).username
    });
  }
  getScorePlayerScore(socketId: string) {
    return this.players.find((player) => player.socketId === socketId).score;
  }
  getScoreHistoryForAllGames() {
    return this.gameHistory
  }
}
