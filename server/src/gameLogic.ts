type GameBoard = Array<Array<string | undefined>>;
type CheckWinnerReturns = "none" | "x" | "o";

export class Game {
  players: Array<{ name: string; character: "x" | "o" }>;
  board: GameBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];
  constructor(users: string[]) {
    this.players = users.map((user, index) => ({
      name: user,
      character: index === 0 ? "x" : "o",
    }));
  }

  insertMove(row: number, cell: number, value: "x" | "o") {
    if (!this.board[row][cell]) {
      this.board[row][cell] = value;
      return { success: true };
    } else {
      return { success: false };
    }
  }
  checkWinner(): CheckWinnerReturns {
    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (
        let cellIndex = 0;
        cellIndex < this.board[rowIndex].length;
        cellIndex++
      ) {
        if (this.board[rowIndex][cellIndex] === "x") {
          const xIsWinner = this.checkMatches("x", rowIndex, cellIndex);
          if (xIsWinner) {
            return "x";
          }
        } else if (this.board[rowIndex][cellIndex] === "o") {
          const oIsWinner = this.checkMatches("o", rowIndex, cellIndex);
          if (oIsWinner) {
            return "o";
          }
        }
      }
    }
    return "none";
  }
  checkMatches(
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
}
