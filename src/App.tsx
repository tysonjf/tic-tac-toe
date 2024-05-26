import { useState } from "react";
import { cn } from "./util/cn";
type GameBoard = Array<Array<string | undefined>>;
const initialBoard: GameBoard = [
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
  [undefined, undefined, undefined],
];
const initialPlayer: "x" | "o" = "x";
const initialWinner: undefined | "x" | "o" = undefined;
function App() {
  const [gameBoard, setGameBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(initialPlayer);
  const [winner, setWinner] = useState(initialWinner);
  const updateGameBoard = (
    selectedCellIndex: number,
    selectedRowIndex: number,
    value: string,
  ) => {
    setGameBoard((prev) => {
      const newBoard = prev.map((row, rowIndex) => {
        return row.map((cell, cellIndex) => {
          if (
            rowIndex === selectedRowIndex &&
            cellIndex === selectedCellIndex
          ) {
            return value;
          } else {
            return cell;
          }
        });
      });
      return newBoard;
    });
    setCurrentPlayer((prev) => (prev === "x" ? "o" : "x"));
  };
  const isWinner = !winner && checkWinner(gameBoard);
  if (isWinner && isWinner.winner) {
    setWinner(isWinner.winner);
  }
  const resetGame = () => {
    setGameBoard(initialBoard);
    setCurrentPlayer(initialPlayer);
    setWinner(initialWinner);
  };
  return (
    <div className="mx-auto grid h-dvh place-items-center">
      <div className="flex flex-col">
        {winner && (
          <h1
            className={cn("text-lg font-bold w-full text-center", {
              "text-pink-200": winner === "x",
              "text-emerald-200": winner === "o",
            })}
          >
            winner is: {winner}!!!
          </h1>
        )}
        <h1 className="text-center w-full pb-4">
          player: {currentPlayer}'s go
        </h1>
        <div>
          {gameBoard.map((row, rowIndex) => {
            return (
              <div key={rowIndex} className="flex">
                {row.map((cell, cellIndex) => {
                  return (
                    <button
                      key={cellIndex}
                      disabled={Boolean(cell) || Boolean(winner)}
                      onClick={() => {
                        updateGameBoard(cellIndex, rowIndex, currentPlayer);
                      }}
                      className={cn(
                        "size-14 border [&:not(:disabled)]:hover:bg-slate-100 ",
                        {
                          "bg-pink-200": cell === "x",
                          "bg-emerald-200": cell === "o",
                        },
                      )}
                    >
                      {cell}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <button
          className="mt-4 py-2 px-4 bg-red-300 hover:bg-red-200"
          onClick={resetGame}
        >
          reset game
        </button>
      </div>
    </div>
  );
}
type WinnerReturns = {
  winningPositions: { rowIndex: number; cellIndex: number }[];
  winner: "x" | "o" | undefined;
};
function checkWinner(game: GameBoard): WinnerReturns {
  const winningPositions = [{ rowIndex: 0, cellIndex: 0 }];

  for (let rowIndex = 0; rowIndex < game.length; rowIndex++) {
    for (let cellIndex = 0; cellIndex < game[rowIndex].length; cellIndex++) {
      if (game[rowIndex][cellIndex] === "x") {
        const xIsWinner = checkLogic(game, "x", rowIndex, cellIndex);
        if (xIsWinner) {
          return {
            winningPositions,
            winner: "x",
          };
        }
      } else if (game[rowIndex][cellIndex] === "o") {
        const oIsWinner = checkLogic(game, "o", rowIndex, cellIndex);
        if (oIsWinner) {
          return {
            winningPositions,
            winner: "o",
          };
        }
      }
    }
  }
  return {
    winningPositions,
    winner: undefined,
  };
}
function checkLogic(
  game: GameBoard,
  checkCharacter: "x" | "o",
  rowIndex: number,
  cellIndex: number,
): boolean {
  // check along the rows

  if (cellIndex + 2 < game[rowIndex].length) {
    if (
      game[rowIndex][cellIndex] === checkCharacter &&
      game[rowIndex][cellIndex + 1] === checkCharacter &&
      game[rowIndex][cellIndex + 2] === checkCharacter
    ) {
      return true;
    }
  }

  if (rowIndex + 2 < game.length) {
    // check if there is a match along the y axis (vertical match)
    if (
      game[rowIndex][cellIndex] === checkCharacter &&
      game[rowIndex + 1][cellIndex] === checkCharacter &&
      game[rowIndex + 2][cellIndex] === checkCharacter
    ) {
      return true;
    }
  }
  // check along the diagonal right angle (top left to bottom right) which will be next rowIndex and next cellIndex
  if (rowIndex + 2 < game.length && cellIndex + 2 < game[rowIndex].length) {
    if (
      game[rowIndex][cellIndex] === checkCharacter &&
      game[rowIndex + 1][cellIndex + 1] === checkCharacter &&
      game[rowIndex + 2][cellIndex + 2] === checkCharacter
    ) {
      return true;
    }
  }
  // check along the diagonal left angle (top right to bottom left) which will be next rowIndex and the next cellIndex
  if (rowIndex + 2 < game.length && cellIndex - 2 >= 0) {
    if (
      game[rowIndex][cellIndex] === checkCharacter &&
      game[rowIndex + 1][cellIndex - 1] === checkCharacter &&
      game[rowIndex + 2][cellIndex - 2] === checkCharacter
    ) {
      return true;
    }
  }
  return false;
}
export default App;
