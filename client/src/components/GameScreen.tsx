import { useEffect } from "react";
import { useSocket } from "@sockets/gameSocket/useSocket";
import { cn } from "../util/cn";
import { useAppDispatch, useAppSelector } from "@/store/storeHooks";
import {
  gameOver,
  lookingForGame,
  opponentMoved,
  startGame,
  userMoved,
  leaveGame,
  opponentLeft,
} from "@/store/gameSlice";
import assert from "@/util/assert";
import TitleSection from "./GameTitle";

function GameScreen() {
  const ws = useSocket();
  const dispatch = useAppDispatch();
  useEffect(() => {
    ws?.on("gameStarted", (player) => {
      dispatch(startGame(player.playerCode));
    });
    ws?.on("gameOver", (data) => {
      if (data.complete) {
        dispatch(gameOver({ winner: data.winner }));
      }
    });
    ws?.on("opponentLeftGame", () => {
      dispatch(opponentLeft());
    });

    return () => {
      ws?.off("opponentLeftGame");
      ws?.off("gameOver");
      ws?.off("gameStarted");
    };
  }, [ws]);

  return (
    <div className="mx-auto grid h-dvh place-items-center">
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
  );
}

export default GameScreen;

function ControlPanel() {
  const ws = useSocket();
  const gameProgress = useAppSelector(({ game }) => game.gameProgress);
  const dispatch = useAppDispatch();

  const lookForGame = async () => {
    if (gameProgress === "inProgress") {
      ws?.emit("leaveGame");
    }
    dispatch(lookingForGame());
    const res = await ws?.emitWithAck("lookingForGame");
    if (res?.success) {
      dispatch(startGame(res.data.playerCode));
    }
  };
  const handleLeaveGame = () => {
    ws?.emit("leaveGame");
    dispatch(leaveGame());
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={lookForGame}
        className="py-2 px-4 bg-green-300 hover:bg-green-200 rounded transition"
      >
        Look for new game
      </button>
      <button
        disabled={gameProgress !== "inProgress"}
        onClick={handleLeaveGame}
        className="py-2 px-4 bg-rose-300 [&:not(:disabled)]:hover:bg-rose-200 disabled:bg-gray-400 rounded transition"
      >
        leave game
      </button>
    </div>
  );
}

function GameBoard() {
  const ws = useSocket();
  const game = useAppSelector(({ game }) => game);
  const dispatch = useAppDispatch();
  useEffect(() => {
    ws?.on("opponentMoved", ({ rowIndex, cellIndex }) => {
      dispatch(opponentMoved({ rowIndex, cellIndex }));
    });
    return () => {
      ws?.off("opponentMoved");
    };
  }, [ws]);

  return game.gameBoard.map((row, rowIndex) => {
    return (
      <div key={rowIndex} className="flex">
        {row.map((cell, cellIndex) => {
          return (
            <GameSquare
              key={cellIndex}
              rowIndex={rowIndex}
              cellIndex={cellIndex}
              state={cell}
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
}: {
  state: "x" | "o" | undefined;
  rowIndex: number;
  cellIndex: number;
}) {
  const ws = useSocket();
  const game = useAppSelector(({ game }) => game);
  const dispatch = useAppDispatch();
  const handleMakeMove = () => {
    assert(game.playerCode, "Player code is not defined");
    ws?.emit("makeMove", rowIndex, cellIndex, game.playerCode);
    dispatch(userMoved({ rowIndex, cellIndex }));
  };
  const disabled =
    !game.isUsersTurn ||
    game.gameProgress === "finished" ||
    game.gameProgress === "idle" ||
    game.gameProgress === "lookingForGame" ||
    game.gameProgress === "opponentLeft" ||
    Boolean(state);
  return (
    <button
      disabled={disabled}
      onClick={handleMakeMove}
      className={cn("size-14 border [&:not(:disabled)]:hover:bg-slate-100 ", {
        "bg-pink-200": state !== game.playerCode,
        "bg-emerald-200": state === game.playerCode && game.playerCode,
        "bg-slate-300": !state,
      })}
    >
      {state}
    </button>
  );
}
