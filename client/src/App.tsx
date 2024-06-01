import { useContext, useEffect, useReducer, useState } from "react";
import { cn } from "./util/cn";
import { useSocket } from "./useSocket";
import { createContext } from "react";
type GameBoard = Array<Array<"x" | "o" | undefined>>;
type TPlayerInfo = {
  roomId: string;
  playerCode: "x" | "o" | undefined;
};
const initialPlayerInfo: TPlayerInfo = {
  roomId: "",
  playerCode: undefined,
};

const GameInfo = createContext({
  isActiveGame: false,
  isLookingForGame: false,
  isYourTurn: false,
  playerInfo: initialPlayerInfo,
  setIsYourTurn: (state: boolean) => {
    state;
  },
  gameProgress: { complete: false, winner: "noone", opponentLeft: false },
});
// TODO: Use a reducer for the game state
type TGameState = {
  state: "idle" | "finished" | "opponentLeft" | "inProgress" | "lookingForGame";
  playerCode: "x" | "o" | undefined;
  winner: "x" | "o" | "draw" | "noone";
  isUsersTurn: boolean;
};
const initialGameState: TGameState = {
  state: "idle",
  playerCode: undefined,
  winner: "noone",
  isUsersTurn: false,
};
type TGameAction =
  | { type: "idle" }
  | { type: "gameStarted"; playerCode: "x" | "o" }
  | { type: "gameOver"; winner: "x" | "o" | "draw" | "noone" }
  | { type: "opponentMoved" }
  | { type: "opponentLeft" }
  | { type: "lookingForGame" };

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
    case "opponentMoved": {
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
  const [isActiveGame, setIsActiveGame] = useState(false);
  const [isLookingForGame, setIsLookingForGame] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [gameProgress, setGameProgress] = useState<{
    complete: boolean;
    winner: "x" | "o" | "noone";
    opponentLeft: boolean;
  }>({ complete: false, winner: "noone", opponentLeft: false });
  const [playerInfo, setPlayerInfo] = useState<TPlayerInfo>({
    roomId: "",
    playerCode: undefined,
  });
  useEffect(() => {
    WS?.on("gameStarted", (player) => {
      setPlayerInfo(player);
      setIsActiveGame(true);
      setIsLookingForGame(false);
      if (player.playerCode === "x") {
        setIsYourTurn(true);
      } else {
        setIsYourTurn(false);
      }
    });
    WS?.on("gameOver", (data) => {
      setGameProgress({ ...data, opponentLeft: false });
    });
    WS?.on("opponentLeftGame", () => {
      setGameProgress({
        winner: "noone",
        complete: true,
        opponentLeft: true,
      });
    });
    return () => {
      WS?.off("gameStarted");
      WS?.off("gameOver");
    };
  }, [WS]);
  const lookForGame = () => {
    setPlayerInfo(initialPlayerInfo);
    setIsActiveGame(false);
    setIsLookingForGame(true);
    setIsYourTurn(false);
    setGameProgress({ complete: false, winner: "noone", opponentLeft: false });
    WS?.emit("lookingForGame");
  };
  return (
    <GameInfo.Provider
      value={{
        isYourTurn,
        setIsYourTurn,
        isLookingForGame,
        isActiveGame,
        playerInfo,
        gameProgress,
      }}
    >
      <div className="mx-auto grid h-dvh place-items-center">
        <div>
          {isActiveGame ? (
            <>
              <h1>Game started! You are player: {playerInfo.playerCode}</h1>
              <p>{isYourTurn ? "Your turn." : "Opponents turn."}</p>
            </>
          ) : null}
          {isLookingForGame ? <h1>Looking for game...</h1> : null}
          {gameProgress.complete && !gameProgress.opponentLeft ? (
            <h1>The game winner is: {gameProgress.winner}!</h1>
          ) : gameProgress.opponentLeft ? (
            <h1>Opponent left, find a new opponent...</h1>
          ) : null}
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
    </GameInfo.Provider>
  );
}

function GameBoard() {
  const initialBoard: GameBoard = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];
  const [gameBoard, setGameBoard] = useState(initialBoard);
  const gameState = useContext(GameInfo);
  const WS = useSocket();
  useEffect(() => {
    WS?.on("opponentMoved", ({ rowIndex, cellIndex, playerCode }) => {
      updateGameBoard({ rowIndex, cellIndex, playerCode });
      gameState.setIsYourTurn(true);
    });
    if (!gameState.isActiveGame) {
      setGameBoard(initialBoard);
    }
    return () => {
      WS?.off("opponentMoved");
    };
  }, [WS, gameState.isActiveGame]);

  const updateGameBoard = async (move: {
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
  const gameState = useContext(GameInfo);
  const [isLoading, setIsLoading] = useState(false);
  const makeMove = async () => {
    if (!gameState.playerInfo.playerCode) return;
    try {
      setIsLoading(true);
      const res = await WS?.emitWithAck(
        "makeMove",
        rowIndex,
        cellIndex,
        gameState.playerInfo.playerCode,
      );
      if (res?.success) {
        gameState.setIsYourTurn(false);
        updateGameBoardCallBack({
          rowIndex: res.row,
          cellIndex: res.cell,
          playerCode: gameState.playerInfo.playerCode,
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
    !gameState.isYourTurn ||
    gameState.gameProgress.complete ||
    Boolean(state);
  return (
    <button
      disabled={disabled}
      onClick={makeMove}
      className={cn("size-14 border [&:not(:disabled)]:hover:bg-slate-100 ", {
        "bg-pink-200": state !== gameState.playerInfo.playerCode,
        "bg-emerald-200":
          state === gameState.playerInfo.playerCode &&
          gameState.playerInfo.playerCode,
        "bg-slate-300": !state,
      })}
    >
      {state}
    </button>
  );
}

export default App;
