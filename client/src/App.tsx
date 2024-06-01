import { useContext, useEffect, useReducer, useState } from "react";
import { cn } from "./util/cn";
import { useSocket } from "./useSocket";
import { createContext } from "react";
type GameBoard = Array<Array<"x" | "o" | undefined>>;
type TGameState = {
  state: "idle" | "finished" | "opponentLeft" | "inProgress" | "lookingForGame";
  playerCode: "x" | "o" | undefined;
  winner: "x" | "o" | "draw" | "noone";
  isUsersTurn: boolean;
};
type TGameAction =
  | { type: "idle" }
  | { type: "gameStarted"; playerCode: "x" | "o" }
  | { type: "gameOver"; winner: "x" | "o" | "draw" | "noone" }
  | { type: "someoneMoved" }
  | { type: "opponentLeft" }
  | { type: "lookingForGame" };
const initialGameState: TGameState = {
  state: "idle",
  playerCode: undefined,
  winner: "noone",
  isUsersTurn: false,
};

const GameState = createContext<{
  state: TGameState;
  dispatch: (action: TGameAction) => void;
}>({
  state: initialGameState,
  dispatch: () => {},
});
const reducer = (state: TGameState, action: TGameAction): TGameState => {
  switch (action.type) {
    case "gameStarted": {
      return {
        state: "inProgress",
        winner: "noone",
        playerCode: action.playerCode,
        isUsersTurn: action.playerCode === "x",
      };
    }
    case "idle": {
      return {
        ...state,
        state: "idle",
      };
    }
    case "gameOver": {
      return {
        ...state,
        state: "finished",
        winner: action.winner,
      };
    }
    case "opponentLeft": {
      return {
        state: "opponentLeft",
        playerCode: undefined,
        winner: "noone",
        isUsersTurn: false,
      };
    }
    case "lookingForGame": {
      return {
        state: "lookingForGame",
        playerCode: undefined,
        winner: "noone",
        isUsersTurn: false,
      };
    }
    case "someoneMoved": {
      console.log(state);
      return {
        ...state,
        isUsersTurn: !state.isUsersTurn,
      };
    }
    default:
      return state;
  }
};

function App() {
  const WS = useSocket();
  const [gameState, dispatch] = useReducer(reducer, initialGameState);
  useEffect(() => {
    WS?.on("gameStarted", (player) => {
      dispatch({ type: "gameStarted", playerCode: player.playerCode });
    });
    WS?.on("gameOver", (data) => {
      // TODO: backend is triggering game over early
      // console.log("gameOver", data);
      // dispatch({ type: "gameOver", winner: data.winner });
    });
    WS?.on("opponentLeftGame", () => {
      dispatch({ type: "opponentLeft" });
    });
    return () => {
      WS?.off("opponentLeftGame");
      WS?.off("gameStarted");
      WS?.off("gameOver");
    };
  }, [WS]);
  const lookForGame = () => {
    WS?.emit("lookingForGame");
    dispatch({ type: "lookingForGame" });
  };
  return (
    <GameState.Provider value={{ state: gameState, dispatch }}>
      <div className="mx-auto grid h-dvh place-items-center">
        <div>
          {gameState.state === "lookingForGame" ? (
            <h1>Looking for game...</h1>
          ) : null}
          {gameState.state === "inProgress" ? <h1>Game in progress!</h1> : null}
          {/* {isActiveGame ? ( */}
          {/*   <> */}
          {/*     <h1>Game started! You are player: {playerInfo.playerCode}</h1> */}
          {/*     <p>{isYourTurn ? "Your turn." : "Opponents turn."}</p> */}
          {/*   </> */}
          {/* ) : null} */}
          {/* {isLookingForGame ? <h1>Looking for game...</h1> : null} */}
          {/* {gameProgress.complete && !gameProgress.opponentLeft ? ( */}
          {/*   <h1>The game winner is: {gameProgress.winner}!</h1> */}
          {/* ) : gameProgress.opponentLeft ? ( */}
          {/*   <h1>Opponent left, find a new opponent...</h1> */}
          {/* ) : null} */}
        </div>
        <div>
          <GameBoard />
        </div>
        <div>
          <button
            onClick={lookForGame}
            className="mt-4 py-2 px-4 bg-green-300 hover:bg-green-200 rounded transition"
          >
            Look for new game
          </button>
          <button
            // onClick={leaveGame}
            className="py-2 px-4 rounded bg-rose-300 hover:bg-rose-200 transition"
          >
            leave game
          </button>
        </div>
      </div>
    </GameState.Provider>
  );
}

function GameBoard() {
  const initialBoard: GameBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];
  const [gameBoard, setGameBoard] = useState(initialBoard);
  const gameState = useContext(GameState);
  const WS = useSocket();
  useEffect(() => {
    WS?.on("opponentMoved", ({ rowIndex, cellIndex, playerCode }) => {
      updateGameBoard({ rowIndex, cellIndex, playerCode });
    });
    if (
      gameState.state.state === "idle" ||
      gameState.state.state === "lookingForGame"
    ) {
      setGameBoard(initialBoard);
    }
    return () => {
      WS?.off("opponentMoved");
    };
  }, [WS, gameState]);

  const updateGameBoard = (move: {
    rowIndex: number;
    cellIndex: number;
    playerCode: "x" | "o";
  }) => {
    setGameBoard((prev) => {
      return prev.map((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          return rowIndex === move.rowIndex && cellIndex === move.cellIndex
            ? move.playerCode
            : cell;
        }),
      );
    });
    gameState.dispatch({ type: "someoneMoved" });
  };
  return gameBoard.map((row, rowIndex) => {
    return (
      <div key={rowIndex} className="flex">
        {row.map((cell, cellIndex) => {
          return (
            <GameSquare
              key={cellIndex}
              rowIndex={rowIndex}
              cellIndex={cellIndex}
              state={cell}
              updateGameBoardCallBack={updateGameBoard}
            />
          );
        })}
      </div>
    );
  });
}
function GameSquare({
  state,
  rowIndex,
  cellIndex,
  updateGameBoardCallBack,
}: {
  state: "x" | "o" | undefined;
  rowIndex: number;
  cellIndex: number;
  updateGameBoardCallBack: (move: {
    rowIndex: number;
    cellIndex: number;
    playerCode: "x" | "o";
  }) => void;
}) {
  const WS = useSocket();
  const gameState = useContext(GameState);
  const [isLoading, setIsLoading] = useState(false);
  const makeMove = async () => {
    if (!gameState.state.playerCode) return;
    try {
      setIsLoading(true);
      const res = await WS?.emitWithAck(
        "makeMove",
        rowIndex,
        cellIndex,
        gameState.state.playerCode,
      );
      if (res?.success) {
        updateGameBoardCallBack({
          rowIndex: res.row,
          cellIndex: res.cell,
          playerCode: gameState.state.playerCode,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const disabled =
    isLoading ||
    !gameState.state.isUsersTurn ||
    gameState.state.state === "finished" ||
    gameState.state.state === "idle" ||
    gameState.state.state === "lookingForGame" ||
    gameState.state.state === "opponentLeft" ||
    Boolean(state);
  return (
    <button
      disabled={disabled}
      onClick={makeMove}
      className={cn("size-14 border [&:not(:disabled)]:hover:bg-slate-100 ", {
        "bg-pink-200": state !== gameState.state.playerCode,
        "bg-emerald-200":
          state === gameState.state.playerCode && gameState.state.playerCode,
        "bg-slate-300": !state,
      })}
    >
      {state}
    </button>
  );
}

export default App;
