// TODO: Ability to leave a <game></game>
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useSocket } from "@sockets/gameSocket/useSocket";
import { cn } from "../util/cn";
import { useAppSelector } from "@store/storeHooks";
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
      return {
        ...state,
        isUsersTurn: !state.isUsersTurn,
      };
    }
    default:
      return state;
  }
};
function GameScreen() {
  const WS = useSocket();
  // const dispatchTest = useAppDispatch();
  const gameTestState = useAppSelector((state) => state.game);
  console.log(gameTestState.gameProgress);
  const [gameState, dispatch] = useReducer(reducer, initialGameState);
  useEffect(() => {
    WS?.on("gameStarted", (player) => {
      dispatch({ type: "gameStarted", playerCode: player.playerCode });
    });
    WS?.on("gameOver", (data) => {
      dispatch({ type: "gameOver", winner: data.winner });
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
  return (
    <GameState.Provider value={{ state: gameState, dispatch }}>
      <div className="mx-auto grid h-dvh place-items-center">
        <button
          onClick={() => {
            console.log("click");
          }}
        >
          TEST
        </button>
        <div>
          <TitleSection />
        </div>
        <div>
          <GameBoard />
        </div>
        <div>
          <ControlPanel />
        </div>
      </div>
    </GameState.Provider>
  );
}

export default GameScreen;

function ControlPanel() {
  const { state, dispatch } = useContext(GameState);

  const lookForGame = () => {
    // WS?.emit("lookingForGame");
    dispatch({ type: "lookingForGame" });
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={lookForGame}
        className="py-2 px-4 bg-green-300 hover:bg-green-200 rounded transition"
      >
        Look for new game
      </button>
      {state.state === "inProgress" ? (
        <button
          // onClick={leaveGame}
          className="py-2 px-4 bg-rose-300 hover:bg-rose-200 rounded transition"
        >
          leave game
        </button>
      ) : null}
    </div>
  );
}
function TitleSection() {
  const {
    state: { state, playerCode, isUsersTurn, winner },
  } = useContext(GameState);

  const winnerMessage =
    winner === "x" || winner === "o"
      ? winner === playerCode
        ? "You won!"
        : "You lost!"
      : winner === "draw"
        ? "It was a draw!"
        : "Noone won...";
  if (state === "finished") {
    return <h1>Game finished. {winnerMessage}</h1>;
  }

  if (state === "lookingForGame") {
    return <h1>Looking for game...</h1>;
  }

  if (state === "idle") {
    return <h1>Ready to play? Click look for a game.</h1>;
  }

  if (state === "opponentLeft") {
    return <h1>Uh oh. Your opponent left...</h1>;
  }
  if (state === "inProgress") {
    return (
      <h1>
        Game in progress. You are playing as {playerCode},{" "}
        {isUsersTurn ? "your turn" : "opponents turn"}.
      </h1>
    );
  }
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
